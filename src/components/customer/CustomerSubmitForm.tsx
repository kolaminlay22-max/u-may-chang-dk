import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createCustomerSubmission } from "../../services/customerSubmissionService";
import type { CustomerPhotoItem } from "../../types/customerSubmission";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./CustomerSubmitForm.css";

const createEmptyItem = (): CustomerPhotoItem => ({
  id: crypto.randomUUID(),
  imageUrl: "",
  size: "",
  quantity: 1,
  color: "",

  customColor: "",
});

function CustomerSubmitForm() {
  const [fullName, setFullName] = useState("");
  const [tiktokName, setTiktokName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  const [items, setItems] = useState<CustomerPhotoItem[]>([
    createEmptyItem(),
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [historyPhone, setHistoryPhone] = useState("");
const [pendingRemoveItemId, setPendingRemoveItemId] =
  useState<string | null>(null);
  useEffect(() => {
  if (!pendingRemoveItemId) {
    return;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setPendingRemoveItemId(null);
    }
    
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [pendingRemoveItemId]);
useEffect(() => {
  const loadOrderHistory = async () => {
    const snapshot = await getDocs(
      collection(db, "customerSubmissions")
    );

    setOrderHistory(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  loadOrderHistory();
}, []);
  const handleAddPhotoItem = () => {
    setItems((previousItems) => [
      ...previousItems,
      createEmptyItem(),
    ]);
  };

  const handleRemovePhotoItem = (itemId: string) => {
    setItems((previousItems) => {
      const itemToRemove = previousItems.find(
        (item) => item.id === itemId
      );

      if (itemToRemove?.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(itemToRemove.imageUrl);
      }

      return previousItems.filter((item) => item.id !== itemId);
    });
  };

  const handleItemChange = (
    itemId: string,
    field: keyof CustomerPhotoItem,
    value: string | number
  ) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handlePhotoChange = (
    itemId: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (item.imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.imageUrl);
        }

        return {
          ...item,
          imageUrl: previewUrl,
          file,
        };
      })
    );

    setMessage("");
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!tiktokName.trim()) {
      return "Please enter your TikTok name.";
    }

    if (!phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!address.trim()) {
      return "Please enter your shipping address.";
    }

    if (items.length === 0) {
      return "Please add at least one product.";
    }

    const invalidItemIndex = items.findIndex(
      (item) =>
        !item.imageUrl ||
        !item.size ||
        !item.color ||
        item.quantity < 1 ||
        (item.color === "Other" &&
          !item.customColor?.trim())
    );

    if (invalidItemIndex !== -1) {
      return `Please complete all information for Product ${
        invalidItemIndex + 1
      }.`;
    }

    return "";
  };

  const resetForm = () => {
    items.forEach((item) => {
      if (item.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.imageUrl);
      }
    });

    setFullName("");
    setTiktokName("");
    setPhone("");
    setAddress("");
    setCity("");
    setNote("");
    setItems([createEmptyItem()]);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setMessage("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadedItems = await Promise.all(
  items.map(async (item) => {
    if (!item.file) {
      return item;
    }

    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("upload_preset", "umay_chang_products");

  const response = await fetch(
  "https://api.cloudinary.com/v1_1/nuvrjklv/image/upload",
  {
    method: "POST",
    body: formData,
  }
);

    const result = await response.json();

  const { file: _file, ...itemWithoutFile } = item;

return {
  ...itemWithoutFile,
  imageUrl: result.secure_url,
};
})
);


      await createCustomerSubmission({
        fullName: fullName.trim(),
        tiktokName: tiktokName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        note: note.trim(),
        items: uploadedItems,
      });

      resetForm();
      setMessage(
        "Your order was submitted successfully. Thank you!"
      );
    } catch (error) {
      console.error("Customer submission failed:", error);
      setMessage(
        "Submission failed. Please check your information and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );
  const filteredOrderHistory = orderHistory.filter((order) => {
  const orderPhone = String(order.phone || "").trim();
  const searchPhone = historyPhone.trim();

  if (!searchPhone) {
    return false;
  }

  return orderPhone === searchPhone;
});
filteredOrderHistory.sort((a, b) => {
  const timeA =
    a.createdAt?.seconds ?? 0;

  const timeB =
    b.createdAt?.seconds ?? 0;

  return timeB - timeA;
});
  return (
    <>
  {pendingRemoveItemId && (
    <div
  className="customer-submit-confirm-overlay"
  onClick={() => setPendingRemoveItemId(null)}
>
      <div
  className="customer-submit-confirm-modal"
  onClick={(event) => event.stopPropagation()}
>
        <div className="customer-submit-confirm-icon">🗑️</div>

        <h2>Remove Product?</h2>

        <p>
          Are you sure you want to remove this product from your basket?
        </p>

        <div className="customer-submit-confirm-actions">
          <button
            type="button"
            className="customer-submit-confirm-cancel"
            onClick={() => setPendingRemoveItemId(null)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="customer-submit-confirm-remove"
            onClick={() => {
              handleRemovePhotoItem(pendingRemoveItemId);
              setPendingRemoveItemId(null);
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )}

    <main className="customer-submit-page">
      <form
        className="customer-submit-form"
        onSubmit={handleSubmit}
      >
        <header className="customer-submit-header">
          <span className="customer-submit-brand">
            U-MAY CHANG
          </span>

          <h1>Live Order Submission</h1>

          <p>
            Add all the products you want and submit them
            together in one order.
          </p>
        </header>

        <section className="customer-submit-section">
          <div className="customer-submit-section-header">
            <span className="customer-submit-step">01</span>

            <div>
              <h2>Customer Information</h2>
              <p>
                Enter your contact and shipping information.
              </p>
            </div>
          </div>

          <div className="customer-submit-fields">
            <label className="customer-submit-field">
              <span>Full Name *</span>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Your full name"
                autoComplete="name"
              />
            </label>

            <label className="customer-submit-field">
              <span>TikTok Name *</span>

              <input
                type="text"
                value={tiktokName}
                onChange={(event) =>
                  setTiktokName(event.target.value)
                }
                placeholder="@customername"
                autoComplete="off"
              />
            </label>

            <label className="customer-submit-field">
              <span>Phone Number *</span>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Phone number"
                autoComplete="tel"
              />
            </label>

            <label className="customer-submit-field">
              <span>City / Township</span>

              <input
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="Bangkok, Yangon..."
                autoComplete="address-level1"
              />
            </label>

            <label className="customer-submit-field customer-submit-field-full">
              <span>Shipping Address *</span>

              <textarea
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="House number, street, township and postal code"
                rows={4}
                autoComplete="street-address"
              />
            </label>

            <label className="customer-submit-field customer-submit-field-full">
              <span>Customer Note</span>

              <textarea
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="Delivery instructions or other notes"
                rows={3}
              />
            </label>
          </div>
        </section>

        <section className="customer-submit-section">
          <div className="customer-submit-section-header">
            <span className="customer-submit-step">02</span>

            <div>
              <h2>Add Products</h2>
              <p>
                Add a photo, size, color and quantity for
                every product.
              </p>
            </div>
          </div>

          <div className="customer-submit-basket-count">
            <span>Basket Products</span>
            <strong>{items.length}</strong>

            <span>Total Quantity</span>
            <strong>{totalQuantity}</strong>
          </div>

          <div className="customer-submit-items">
            {items.map((item, index) => (
              <article
                key={item.id}
                className="customer-submit-item-card"
              >
                <div className="customer-submit-item-header">
                  <h3>Product {index + 1}</h3>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="customer-submit-remove-item"
                      onClick={() =>
                        handleRemovePhotoItem(item.id)
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="customer-submit-field customer-submit-field-full">
                  <span>Product Photo *</span>

                  <input
                    id={`photo-${item.id}`}
                     className="customer-submit-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handlePhotoChange(item.id, event)
                    }
                  />

              {item.imageUrl ? (
  <div className="customer-submit-photo-preview">
    <img
      src={item.imageUrl}
      alt={`Product ${index + 1}`}
    />

    <button
      type="button"
      className="customer-submit-remove-photo"
   onClick={() => setPendingRemoveItemId(item.id)}
    >
      ✕
    </button>
  </div>
) : (
                    <label
                      className="customer-submit-photo-placeholder"
                      htmlFor={`photo-${item.id}`}
                    >
                      <strong>Choose Product Photo</strong>
                      <small>
                        Tap here to select a screenshot or
                        gallery photo
                      </small>
                    </label>
                  )}
                </div>

                <div className="customer-submit-item-grid">
                  <label className="customer-submit-field">
                    <span>Size *</span>

                    <select
                      value={item.size}
                      onChange={(event) =>
                        handleItemChange(
                          item.id,
                          "size",
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select size
                      </option>
                      <option value="Free Size">
                        Free Size
                      </option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="2XL">2XL</option>
                    </select>
                  </label>

                  <label className="customer-submit-field">
                    <span>Quantity *</span>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(
                          item.id,
                          "quantity",
                          Math.max(
                            1,
                            Number(event.target.value)
                          )
                        )
                      }
                    />
                  </label>

                  <label className="customer-submit-field">
                    <span>Color *</span>

                    <select
                      value={item.color}
                      onChange={(event) =>
                        handleItemChange(
                          item.id,
                          "color",
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select color
                      </option>
                      <option value="Black">Black</option>
                      <option value="White">White</option>
                      <option value="Red">Red</option>
                      <option value="Blue">Blue</option>
                      <option value="Pink">Pink</option>
                      <option value="Purple">
                        Purple
                      </option>
                      <option value="Green">Green</option>
                      <option value="Brown">Brown</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  {item.color === "Other" && (
                    <label className="customer-submit-field">
                      <span>Custom Color *</span>

                      <input
                        type="text"
                        value={item.customColor ?? ""}
                        onChange={(event) =>
                          handleItemChange(
                            item.id,
                            "customColor",
                            event.target.value
                          )
                        }
                        placeholder="Example: Light Purple"
                      />
                    </label>
                  )}
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="customer-submit-add-item"
            onClick={handleAddPhotoItem}
          >
            + Add Another Product
          </button>
        </section>

        <section className="customer-submit-section">
          <div className="customer-submit-section-header">
            <span className="customer-submit-step">03</span>

            <div>
              <h2>Basket Summary</h2>
              <p>
                Check your products before submitting.
              </p>
            </div>
          </div>

      <div className="customer-submit-summary">
  <article className="customer-submit-summary-card">
    <span className="customer-submit-summary-icon">📦</span>

    <div>
      <small>Products</small>
      <strong>{items.length}</strong>
    </div>
  </article>

  <article className="customer-submit-summary-card">
    <span className="customer-submit-summary-icon">🛒</span>

    <div>
      <small>Total Quantity</small>
      <strong>{totalQuantity}</strong>
    </div>
  </article>

  <article className="customer-submit-summary-card">
    <span className="customer-submit-summary-icon">👤</span>

    <div>
      <small>Customer</small>
      <strong>{fullName.trim() || "Not entered"}</strong>
    </div>
  </article>
</div>
        </section>

        <footer className="customer-submit-footer">
          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting Order..."
              : "Submit Live Order"}
          </button>

          {message && (
            <p
              className={`customer-submit-message ${
                message.includes("successfully")
                  ? "success"
                  : "error"
              }`}
            >
              {message}
            </p>
          )}
        </footer>
      </form>
  <section className="customer-order-history">
  <h2>📦 My Order History</h2>

  <input
    type="tel"
    placeholder="Enter your phone number"
    value={historyPhone}
    onChange={(event) => setHistoryPhone(event.target.value)}
  />

  <p>Your orders: {filteredOrderHistory.length}</p>
  {filteredOrderHistory.map((order) => {
  const orderTotal = (order.items || []).reduce(
    (total: number, item: any) =>
      total + Number(item.livePrice || 0) * Number(item.quantity || 0),
    0
  );

  return (
  <div key={order.id} className="customer-history-card">
    <div className="customer-history-meta">
  <span>
    Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}
  </span>

  <span>
    {order.createdAt?.toDate
      ? order.createdAt.toDate().toLocaleDateString()
      : "No date"}
  </span>
</div>
  <h3 className="customer-history-name">
  {order.fullName}
</h3>

  <div>{order.phone}</div>

  <div
  className={`customer-history-status customer-history-status--${
    order.status || "waiting"
  }`}
>
  {order.status || "waiting"}
</div>

  {order.items?.map((item: any, index: number) => (
    <div key={index}>
   
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt=""
          width={80}
        />
      )}

      <div>Size: {item.size}</div>
      <div>Color: {item.color}</div>
      <div>Qty: {item.quantity}</div>
    </div>
     ))}
  </div>
);

})}
</section>
</main>
    </>
  );
  }

export default CustomerSubmitForm;