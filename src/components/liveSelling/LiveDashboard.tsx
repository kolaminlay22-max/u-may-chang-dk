import { useProducts } from "../../hooks/useProducts";
import CustomerSubmissionQueue from "./CustomerSubmissionQueue";
import html2canvas from "html2canvas";
import LiveOrder from "./LiveOrder";
import LiveProductList from "./LiveProductList";
import "./LiveDashboard.css";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import LiveCustomerModal from "./LiveCustomerModal";
import type { LiveCustomerFormData } from "./LiveCustomerModal";
import type { Product } from "../../types/product";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import BrandCard from "./BrandCard";
import { jsPDF } from "jspdf";
type LiveCustomer = LiveCustomerFormData & {
  id: string;
  address?: string;
city?: string;
  queueNumber: number;
  status: "waiting" | "active" | "completed";
  submittedItems?: any[];
};
function LiveDashboard() {
 const { products } = useProducts();
  const modalRef = useRef<HTMLDivElement>(null);
  const brandCardRef = useRef<HTMLDivElement>(null);
const preparedBrandCardRef = useRef<{
  file: File;
  orderKey: string;
} | null>(null);

const shareBrandCard = async () => {
  const preparedBrandCard = preparedBrandCardRef.current;

  if (!selectedHistoryOrder || !preparedBrandCard) {
    alert("Brand Card is still preparing. Please wait a moment and tap again.");
    return;
  }

  const imageFile = preparedBrandCard.file;

  try {
    const canShareFile =
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [imageFile] });

    if (!canShareFile) {
      alert("Sharing is not supported on this browser.");
      return;
    }

    const sharePromise = navigator.share({
      title: "U-May Chang Live Receipt",
      text: "Thank you for shopping with U-May Chang 💜",
      files: [imageFile],
    });

    await sharePromise;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      return;
    }

    console.error("Share failed:", error);

    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    alert(`Share failed:
${errorMessage}`);
  }
};

const exportPDF = async () => {
  if (!brandCardRef.current) return;

  const canvas = await html2canvas(brandCardRef.current, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    canvas.width,
    canvas.height
  );

 const safeCustomerName = (
  selectedHistoryOrder?.customerName || "Customer"
)
  .trim()
  .replace(/[^a-zA-Z0-9-_]/g, "-");

const fileName = `U-May-Chang-${safeCustomerName}.pdf`;

const pdfBlob = pdf.output("blob");
const pdfUrl = URL.createObjectURL(pdfBlob);

const link = document.createElement("a");
link.href = pdfUrl;
link.download = fileName;
link.style.display = "none";

document.body.appendChild(link);
link.click();
document.body.removeChild(link);

setTimeout(() => {
  URL.revokeObjectURL(pdfUrl);
}, 1000);
};
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

const [customerForm, setCustomerForm] =
  useState<LiveCustomerFormData>({
    name: "",
    phone: "",
    tiktokUsername: "",
    comment: "",
  });

const [savingCustomer, setSavingCustomer] = useState(false);
const [autoNextEnabled, setAutoNextEnabled] = useState(true);
const [editingCustomerId, setEditingCustomerId] =
  useState<string | null>(null);
const [customers, setCustomers] = useState<LiveCustomer[]>([]);
useEffect(() => {
  const liveCustomersQuery = query(
    collection(db, "liveCustomers"),
    orderBy("queueNumber", "asc")
  );

  const unsubscribe = onSnapshot(liveCustomersQuery, (snapshot) => {
    const liveCustomers = snapshot.docs.map((customerDocument) => ({
      id: customerDocument.id,
      ...customerDocument.data(),
    })) as LiveCustomer[];

    setCustomers(liveCustomers);
  });

  return () => unsubscribe();
}, []);
useEffect(() => {
  const currentActiveCustomer =
    customers.find((customer) => customer.status === "active") || null;

  setActiveCustomer(currentActiveCustomer);
}, [customers]);
const [activeCustomer, setActiveCustomer] =
  useState<LiveCustomer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<any | null>(
  null
);
useEffect(() => {
  let cancelled = false;

  const prepareBrandCardImage = async () => {
    if (!selectedHistoryOrder || !brandCardRef.current) {
      preparedBrandCardRef.current = null;
      return;
    }

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });

      const brandCardElement = brandCardRef.current;

      const images = Array.from(
        brandCardElement.querySelectorAll("img")
      );

      await Promise.all(
        images.map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) {
                resolve();
                return;
              }

              image.addEventListener("load", () => resolve(), {
                once: true,
              });

              image.addEventListener("error", () => resolve(), {
                once: true,
              });
            })
        )
      );
await document.fonts.ready;
await new Promise((resolve) => requestAnimationFrame(resolve));
await new Promise((resolve) => setTimeout(resolve, 300));
    const canvas = await html2canvas(brandCardElement, {
  backgroundColor: "#ffffff",
  scale: Math.min(window.devicePixelRatio || 2, 2),
  useCORS: true,
  allowTaint: false,
  logging: false,
  imageTimeout: 15000,

  onclone: (clonedDocument) => {
    const clonedCard = clonedDocument.querySelector(
      ".brand-card"
    ) as HTMLElement | null;

    const clonedCustomerName = clonedDocument.querySelector(
      ".brand-card-customer-name"
    ) as HTMLElement | null;

    if (clonedCard) {
      clonedCard.style.color = "#2d254f";
    }

    if (clonedCustomerName) {
      clonedCustomerName.style.setProperty("color", "#2d254f", "important");
      clonedCustomerName.style.setProperty("opacity", "1", "important");
      clonedCustomerName.style.setProperty("visibility", "visible", "important");
      clonedCustomerName.style.setProperty("-webkit-text-fill-color", "#2d254f", "important");
      clonedCustomerName.style.setProperty("text-shadow", "none", "important");
      clonedCustomerName.style.setProperty("filter", "none", "important");
    }
  },
});

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1);
      });

      if (!blob || cancelled) return;

      const safeCustomerName = (
        selectedHistoryOrder.customerName || "Customer"
      )
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "-");

      const orderKey =
        selectedHistoryOrder.id ||
        selectedHistoryOrder.orderNumber ||
        safeCustomerName;

      preparedBrandCardRef.current = {
        file: new File(
          [blob],
          `U-May-Chang-${safeCustomerName}.png`,
          {
            type: "image/png",
          }
        ),
        orderKey,
      };
    } catch (error) {
      console.error("Brand Card preparation failed:", error);
      preparedBrandCardRef.current = null;
    }
  };

  const timer = window.setTimeout(() => {
    void prepareBrandCardImage();
  }, 200);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}, [selectedHistoryOrder]);
  const [todayOrders, setTodayOrders] = useState(0);
const [todaySales, setTodaySales] = useState(0);
useEffect(() => {
  const liveOrdersQuery = query(
  collection(db, "liveOrders"),
  orderBy("createdAt", "desc")
);

const unsubscribe = onSnapshot(
  liveOrdersQuery,
    (snapshot) => {
      const today = new Date();

      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const todaysOrders = snapshot.docs.filter((document) => {
        const data = document.data();
        const createdAt = data.createdAt?.toDate?.();

        return createdAt && createdAt >= startOfToday;
      });

      const salesTotal = todaysOrders.reduce((total, document) => {
        const data = document.data();
        return total + Number(data.total || 0);
      }, 0);

      setTodayOrders(todaysOrders.length);
      setTodaySales(salesTotal);
      setSalesHistory(
  todaysOrders
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
);
    },
    (error) => {
      console.error("Failed to load live dashboard statistics:", error);
    }
  );

  return () => unsubscribe();
}, []);
  const handleSelectProduct = (product: Product) => {
  setSelectedProducts((currentProducts) => {
    const existingProduct = currentProducts.find(
      (item) => item.id === product.id
    );
    
if (existingProduct) {
      return currentProducts.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: (item.quantity || 1) + 1,
            }
          : item
      );
    }

  return [
  ...currentProducts,
  {
    ...product,
    quantity: 1,
    regularPrice: Number(product.regularPrice ?? product.price) || 0,
    livePrice: Number(product.livePrice ?? product.price) || 0,
  },
];
  });
};
const handleSelectCategory = (category: string) => {
  const categoryProduct = {
    id: `live-${category.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    name: category,
    category,
    image: "",
    price: 0,
    regularPrice: 0,
    livePrice: 0,
  } as Product;

  handleSelectProduct(categoryProduct);
};
const increaseProductQuantity = (productId: string) => {
  setSelectedProducts((currentProducts) =>
    currentProducts.map((product) =>
      product.id === productId
        ? {
            ...product,
            quantity: (product.quantity || 1) + 1,
          }
        : product
    )
  );
};

const decreaseProductQuantity = (productId: string) => {
  setSelectedProducts((currentProducts) =>
    currentProducts
      .map((product) =>
        product.id === productId
          ? {
              ...product,
              quantity: (product.quantity || 1) - 1,
            }
          : product
      )
      .filter((product) => product.quantity > 0)
  );
};

const removeProduct = (productId: string) => {
  setSelectedProducts((currentProducts) =>
    currentProducts.filter((product) => product.id !== productId)
  );
};
const updateProductPrice = (
  productId: string,
  newPrice: number
) => {
  setSelectedProducts((currentProducts) =>
    currentProducts.map((product) =>
      product.id === productId
        ? {
            ...product,
            livePrice: newPrice,
          }
        : product
    )
  );
};
const updateProductSize = (productId: string, size: string) => {
  setSelectedProducts((currentProducts) =>
    currentProducts.map((product) =>
      product.id === productId
        ? {
            ...product,
            size,
          }
        : product
    )
  );
};
const updateProductColor = (productId: string, color: string) => {
  setSelectedProducts((currentProducts) =>
    currentProducts.map((product) =>
      product.id === productId
        ? {
            ...product,
            color,
          }
        : product
    )
  );
}; 
const handleLiveProductImageUpload = async (
  productId: string,
  file: File
) => {
  if (!file.type.startsWith("image/")) {
    alert("Please choose a valid image file.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be smaller than 5 MB.");
    return;
  }

  try {
    const uploadData = new FormData();

    uploadData.append("file", file);
    uploadData.append("upload_preset", "umay_chang_products");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/nuvrjklv/image/upload",
      {
        method: "POST",
        body: uploadData,
      }
    );

    if (!response.ok) {
      throw new Error("Cloudinary upload failed.");
    }

    const result = await response.json();

    if (!result.secure_url) {
      throw new Error("Uploaded image URL was not returned.");
    }

    setSelectedProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              image: result.secure_url,
              image1: result.secure_url,
            }
          : product
      )
    );
  } catch (error) {
    console.error("Live product image upload failed:", error);
    alert("Photo upload failed. Please try again.");
  }
};
const handleLiveProductImageRemove = (productId: string) => {
  setSelectedProducts((currentProducts) =>
    currentProducts.map((product) =>
      product.id === productId
        ? {
            ...product,
            image: "",
            image1: "",
          }
        : product
    )
  );
};
const handleAddVariant = (productId: string) => {
  setSelectedProducts((currentProducts) => {
    const productToCopy = currentProducts.find(
      (product) => product.id === productId
    );

    if (!productToCopy) {
      return currentProducts;
    }

    const newVariant = {
      ...productToCopy,
      id: `${productToCopy.id}-${Date.now()}`,
      quantity: 1,
      size: "Free Size",
      color: "",
    };

    return [...currentProducts, newVariant];
  });
};
const handleCustomerFormChange = (
  event:
    | ChangeEvent<HTMLInputElement>
    | ChangeEvent<HTMLTextAreaElement>
) => {
  const { name, value } = event.target;

  setCustomerForm((currentForm) => ({
    ...currentForm,
    [name]: value,
  }));
};

const closeCustomerModal = () => {
  setSavingCustomer(false);
  setIsCustomerModalOpen(false);
};

const handleCustomerSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  const customerName = customerForm.name.trim();

  if (!customerName) {
    alert("Customer name is required.");
  
    return;
  }

  setSavingCustomer(true);


  if (editingCustomerId) {
  await updateDoc(doc(db, "liveCustomers", editingCustomerId), {
    name: customerName,
    phone: customerForm.phone.trim(),
    tiktokUsername: customerForm.tiktokUsername.trim(),
    comment: customerForm.comment.trim(),
    updatedAt: serverTimestamp(),
  });

  setEditingCustomerId(null);

  setCustomerForm({
    name: "",
    phone: "",
    tiktokUsername: "",
    comment: "",
  });

  setSavingCustomer(false);
  setIsCustomerModalOpen(false);

  return;
}
await addDoc(collection(db, "liveCustomers"), {
  queueNumber:
  customers.length > 0
    ? Math.max(...customers.map((c) => c.queueNumber || 0)) + 1
    : 1,
  status: "waiting",
  name: customerName,
  phone: customerForm.phone.trim(),
  tiktokUsername: customerForm.tiktokUsername.trim(),
  comment: customerForm.comment.trim(),
  createdAt: serverTimestamp(),
});
 
  setCustomerForm({
    name: "",
    phone: "",
    tiktokUsername: "",
    comment: "",
  });

  setSavingCustomer(false);
  setIsCustomerModalOpen(false);
};
const handleCompleteSale = async (finalTotal: number) => {
  if (!activeCustomer) {
    alert("Please select a customer first.");
    return;
  }

  if (selectedProducts.length === 0) {
    alert("Please add at least one product.");
    return;
  }

  try {
    await addDoc(collection(db, "liveOrders"), {
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      phone: activeCustomer.phone || "",
      tiktokUsername: activeCustomer.tiktokUsername || "",
      comment: activeCustomer.comment || "",

      items: selectedProducts.map((product) => ({
        productId: product.id,
        name: product.name,
        image: product.image || "",
image1: product.image1 || product.image || "",
   price: product.livePrice ?? product.price,
quantity: product.quantity || 1,

regularPrice: product.price,
livePrice: product.livePrice ?? product.price,

lineTotal:
  (product.livePrice ?? product.price) *
  (product.quantity || 1),
      })),
      subtotal: selectedProducts.reduce(
  (sum, product) =>
    sum +
    Number(product.livePrice ?? product.price) *
      Number(product.quantity || 1),
  0
),

discountAmount:
  selectedProducts.reduce(
    (sum, product) =>
      sum +
      Number(product.livePrice ?? product.price) *
        Number(product.quantity || 1),
    0
  ) - finalTotal,

      total: finalTotal,
      status: "completed",
      source: "tiktok-live",
      createdAt: serverTimestamp(),
    });

   
await updateDoc(doc(db, "liveCustomers", activeCustomer.id), {
  status: "completed",
  updatedAt: serverTimestamp(),
});
    setSelectedProducts([]);
    const nextCustomer = customers
  .filter(
    (customer) =>
      customer.status === "waiting" &&
      customer.id !== activeCustomer.id
  )
  .sort((a, b) => a.queueNumber - b.queueNumber)[0];
    if (autoNextEnabled && nextCustomer) {
  await updateDoc(doc(db, "liveCustomers", nextCustomer.id), {
    status: "active",
    updatedAt: serverTimestamp(),
  });

  setActiveCustomer({
    ...nextCustomer,
    status: "active",
  });
 
} else {
  setActiveCustomer(null);
}

    alert("Live sale completed successfully.");
  } catch (error) {
    console.error("Failed to complete live sale:", error);
    alert("Failed to save the live sale. Please try again.");
  }
};
const moveCustomerToTop = async (customer: LiveCustomer) => {
  const waitingCustomers = customers
    .filter(
      (currentCustomer) =>
        currentCustomer.status === "waiting" &&
        currentCustomer.id !== customer.id
    )
    .sort((a, b) => a.queueNumber - b.queueNumber);

  await updateDoc(doc(db, "liveCustomers", customer.id), {
    queueNumber: 1,
    updatedAt: serverTimestamp(),
  });

  await Promise.all(
    waitingCustomers.map((currentCustomer, index) =>
      updateDoc(doc(db, "liveCustomers", currentCustomer.id), {
        queueNumber: index + 2,
        updatedAt: serverTimestamp(),
      })
    )
  );
};
const deleteCustomer = async (customerId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to remove this customer?"
  );

  if (!confirmed) return;

  await deleteDoc(doc(db, "liveCustomers", customerId));
};
const editCustomer = (customer: LiveCustomer) => {
  setEditingCustomerId(customer.id);
  setCustomerForm({
    name: customer.name,
    phone: customer.phone || "",
    tiktokUsername: customer.tiktokUsername || "",
    comment: customer.comment || "",
  });

  setIsCustomerModalOpen(true);
};
  const selectCustomer = async (customer: LiveCustomer) => {
 await Promise.all(
  customers
    .filter(
      (currentCustomer) =>
        currentCustomer.status === "active" &&
        currentCustomer.id !== customer.id
    )
    .map((currentCustomer) =>
      updateDoc(doc(db, "liveCustomers", currentCustomer.id), {
        status: "waiting",
        updatedAt: serverTimestamp(),
      })
    )
);

await updateDoc(doc(db, "liveCustomers", customer.id), {
  status: "active",
  updatedAt: serverTimestamp(),
});
 setActiveCustomer({
  ...customer,
  name: customer.name || (customer as any).fullName || "Customer",
  address: (customer as any).address || "",
  city: (customer as any).city || "",
  comment:
    (customer as any).comment ||
    (customer as any).note ||
    "",
  status: "active",
});

  const importedProducts = Array.isArray(customer.submittedItems)
  ? customer.submittedItems.map((item: any, index: number) => ({
      id: item.id || `submitted-${customer.id}-${index}`,
      name: `Submitted Product ${index + 1}`,
      image: item.imageUrl || "",
      quantity: Number(item.quantity || 1),
      size: item.size || "",
      color:
        item.color === "Other"
          ? item.customColor || ""
          : item.color || "",
      price: 0,
      regularPrice: 0,
      livePrice: 0,
      source: "customer-submit",
      
    }))
  : [];

setSelectedProducts(importedProducts);

  };
  return (
    <>
  {selectedHistoryOrder && (
    <div
      ref={brandCardRef}
      className="brand-card-export-wrapper"
      aria-hidden="true"
    >
      <BrandCard order={selectedHistoryOrder} />
    </div>
  )}

    <main className="live-dashboard-page">
      <section className="live-dashboard-container">
        <header className="live-dashboard-header">
          <div>
            <p className="live-dashboard-eyebrow">
              U-MAY CHANG LIVE COMMERCE
            </p>

            <h1>
              <span className="live-status-dot" />
              Live Selling Dashboard
            </h1>

            <p className="live-dashboard-subtitle">
              Manage live customers, orders, products and payments
              from one place.
            </p>
          </div>

          <div className="live-header-actions">
            <span className="live-session-badge">LIVE READY</span>

            <button
  type="button"
  className="start-live-button"
  onClick={() => {
  setEditingCustomerId(null);

  setCustomerForm({
    name: "",
    phone: "",
    tiktokUsername: "",
    comment: "",
  });

  setIsCustomerModalOpen(true);
}}
>
  + Add Customer
</button>
<label className="auto-next-toggle">
  <input
    type="checkbox"
    checked={autoNextEnabled}
    onChange={(event) => setAutoNextEnabled(event.target.checked)}
  />
  Auto Next Customer
</label>
          </div>
        </header>

        <section className="live-summary-grid">
          <article className="live-summary-card">
            <span>Today&apos;s Orders</span>
<strong>{todayOrders}</strong>
<small>
  {todayOrders === 0
    ? "No completed orders yet"
    : "Completed live orders today"}
</small>
          </article>

          <article className="live-summary-card">
            <span>Today&apos;s Sales</span>
<strong>฿{todaySales}</strong>
<small>Total live revenue</small>
          </article>

          <article className="live-summary-card warning">
            <span>Waiting Customers</span>
            <strong>
  {customers.filter((customer) => customer.status === "waiting").length}
</strong>
            <small>Customers in queue</small>
          </article>

          <article className="live-summary-card success">
            <span>Current Customer</span>
           <strong>{activeCustomer?.name || "—"}</strong>

<small>
  {activeCustomer
    ? activeCustomer.tiktokUsername || "Customer selected"
    : "No customer selected"}
</small>
          </article>
        </section>
<CustomerSubmissionQueue
  onApprove={selectCustomer}
/>
        <section className="live-workspace-grid">
          <article className="live-panel live-queue-panel">
            <div className="live-panel-header">
              <div>
                <p className="live-panel-label">CUSTOMER QUEUE</p>
                <h2>Waiting Customers</h2>
              </div>

              <button
  type="button"
  className="live-panel-action"
  onClick={() => setIsCustomerModalOpen(true)}
>
  + Add Customer
</button>
            </div>

   {customers.filter((customer) => customer.status === "waiting").length === 0 ? (
  <div className="live-empty-state">
    <div className="live-empty-icon">👥</div>

    <h3>No customers waiting</h3>

    <p>
      Add a customer when a TikTok comment or order arrives.
    </p>
  </div>
) : (
  <div className="live-customer-list">
   {customers
  .filter((customer) => customer.status === "waiting")
  .sort((a, b) => a.queueNumber - b.queueNumber)
  .map((customer) => (
    <div
  key={customer.id}
  className={`live-customer-card ${
    customer.status === "active" ? "active" : ""
  }`}
>
  <div className="live-customer-card-top">
    <span className="live-queue-number">
      #{String(customer.queueNumber).padStart(3, "0")}
    </span>

    <span
      className={`live-customer-status ${customer.status}`}
    >
      {customer.status === "active" ? "Active" : "Waiting"}
    </span>
  </div>

  <h3>{customer.name}</h3>

  {customer.phone && <p>📞 {customer.phone}</p>}

  {customer.tiktokUsername && (
    <p>🎵 {customer.tiktokUsername}</p>
  )}

  {customer.comment && (
    <small>📝 {customer.comment}</small>
  )}

  <button
    type="button"
    className="select-live-customer-button"
    onClick={() => selectCustomer(customer)}
    disabled={customer.status === "active"}
  >
    {customer.status === "active"
      ? "Selected"
      : "Select Customer"}
  </button>
  <button
  type="button"
  className="delete-live-customer-button"
  onClick={() => deleteCustomer(customer.id)}
>
  🗑 Delete
</button>
<button
  type="button"
  className="edit-live-customer-button"
  onClick={() => editCustomer(customer)}
>
  ✏️ Edit
</button>
<button
  type="button"
  className="priority-live-customer-button"
  onClick={() => moveCustomerToTop(customer)}
>
  ⭐ Move to Top
</button>
</div>
    ))}
  </div>
)}
          </article>

  <article className="live-panel live-order-panel">
  <div className="live-panel-header">
    <div>
      <p className="live-panel-label">CURRENT ORDER</p>
      <h2>Live Order</h2>
    </div>

    <span className="live-order-status">Draft</span>
  </div>

  {!activeCustomer ? (
    <div className="live-empty-state">
      <div className="live-empty-icon">🛒</div>

      <h3>No active order</h3>

      <p>
        Select a customer and add products to start an order.
      </p>
    </div>
  ) : (
    <>
      <LiveOrder
  
        customerName={activeCustomer.name}
        customerPhone={activeCustomer?.phone || ""}
customerTiktokUsername={activeCustomer?.tiktokUsername || ""}
customerAddress={activeCustomer?.address || ""}
customerCity={activeCustomer?.city || ""}
customerNote={activeCustomer?.comment || ""}
        onImageUpload={handleLiveProductImageUpload} 
        onImageRemove={handleLiveProductImageRemove}
        availableProducts={products}
        products={selectedProducts}
        onIncrease={increaseProductQuantity}
        onDecrease={decreaseProductQuantity}
        onRemove={removeProduct}
        onPriceChange={updateProductPrice}
        onSizeChange={updateProductSize}
        onColorChange={updateProductColor}
  onCompleteSale={handleCompleteSale}
 onSelectProduct={handleSelectCategory}
  onAddVariant={handleAddVariant}
      />

      <LiveProductList
        onSelectProduct={handleSelectProduct}
      />
    </>
  )}
</article>
        </section>
      </section>
      <section className="live-sales-history">
  <div className="live-sales-history-header">
    <div>
      <p className="live-panel-label">SALES HISTORY</p>
      <h2>Today&apos;s Live Sales</h2>
    </div>

    <span>{salesHistory.length} Orders</span>
  </div>

  {salesHistory.length === 0 ? (
    <div className="live-sales-history-empty">
      <h3>No completed sales yet</h3>
      <p>Completed live orders will appear here.</p>
    </div>
  ) : (
    <div className="live-sales-history-list">
      {salesHistory.map((order) => (
        <article
  key={order.id}
  className="live-sales-history-card"
  onClick={() => setSelectedHistoryOrder(order)}
>
          <div>
            <h3>{order.customerName}</h3>
            <p>{order.tiktokUsername || "TikTok customer"}</p>
          </div>

          <div className="live-sales-history-items">
            {(order.items || []).map((item: any, index: number) => (
              <span key={`${order.id}-${item.productId}-${index}`}>
                {item.name} ×{item.quantity}
              </span>
            ))}
          </div>

          <div className="live-sales-history-total">
  <strong>฿{order.total}</strong>

  <small>
    {order.createdAt?.toDate
      ? order.createdAt.toDate().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--"}
  </small>

  <>
  <small>
    {order.createdAt?.toDate
      ? order.createdAt.toDate().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : ""}
  </small>

  <span>Completed</span>
</>
</div>
        </article>
      ))}
    </div>
  )}
  {selectedHistoryOrder && (
 <div
  className="live-history-modal-overlay"
  onClick={() => setSelectedHistoryOrder(null)}
>
  <div
  ref={modalRef}
  className="live-history-modal"
  onClick={(event) => event.stopPropagation()}
>
    <div className="live-history-modal-header">
      <div>
        <span className="live-history-modal-label">
          U-MAY CHANG
        </span>

        <h2>Sale Details</h2>

        <p className="live-history-modal-subtitle">
          Completed live-sale order
        </p>
      </div>

      <button
        type="button"
        className="live-history-modal-close"
        data-html2canvas-ignore="true"
        onClick={() => setSelectedHistoryOrder(null)}
        aria-label="Close sale details"
      >
        ×
      </button>
    </div>

    <div className="live-history-customer">
      <div className="live-history-customer-avatar">
        {selectedHistoryOrder.customerName
          ?.trim()
          .charAt(0)
          .toUpperCase() || "C"}
      </div>

      <div className="live-history-customer-info">
        <h3>{selectedHistoryOrder.customerName}</h3>

        <p>
          {selectedHistoryOrder.tiktokUsername ||
            "No social username"}
        </p>
      </div>
    </div>
<div className="live-history-status-row">
  <span className="live-history-status-label">
    Order Status
  </span>

  <span
    className={`live-history-status-badge ${
      selectedHistoryOrder.status === "Delivered"
        ? "delivered"
        : selectedHistoryOrder.status === "Shipped"
        ? "shipped"
        : selectedHistoryOrder.status === "Packing"
        ? "packing"
        : "pending"
    }`}
  >
    {selectedHistoryOrder.status || "Pending"}
  </span>
</div>
    <div className="live-history-divider" />

      <table className="live-history-product-table">
  <thead>
    <tr>
      <th>Image</th>
      <th>Product</th>
      <th>Qty</th>
      <th>Price</th>
      <th>Total</th>
    </tr>
  </thead>

  <tbody>
    {(selectedHistoryOrder.items || []).map(
      (item: any, index: number) => (
        <tr key={index}>
          <td>
  <div className="live-history-item-image">
    {item.image || item.image1 ? (
      <img
        src={item.image || item.image1}
        alt={item.name}
      />
    ) : (
      <span>No Image</span>
    )}
  </div>
</td>
          <td>{item.name}</td>

          <td>{item.quantity}</td>

          <td>฿{item.price}</td>

          <td>
            ฿{Number(item.price) * Number(item.quantity)}
          </td>
        </tr>
      )
    )}
  </tbody>
</table>

      <hr />

      <h2>฿{selectedHistoryOrder.total}</h2>
     <div
  className="live-history-actions"
  data-html2canvas-ignore="true"
>
 
  <button
  type="button"
  className="live-history-share-btn" 
  onClick={shareBrandCard}
>
  📤 Share
</button> 

  <button
  type="button"
  className="live-history-print-btn"
  onClick={exportPDF}
>
  📄 Download PDF
</button>
</div>
    </div>
  </div>
)}
</section>
      <LiveCustomerModal
        isOpen={isCustomerModalOpen}
        form={customerForm}
        saving={savingCustomer}
        isEditing={editingCustomerId !== null}
        onChange={handleCustomerFormChange}
        onSubmit={handleCustomerSubmit}
        onClose={closeCustomerModal}
      />
  </main>
  </>
);
}

export default LiveDashboard;