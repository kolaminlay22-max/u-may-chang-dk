import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./AdminProducts.css";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  sizes: string[];
  description: string;
  createdAt?: unknown;
};

type ProductForm = {
  name: string;
  price: string;
  image: string;
  category: string;
  stock: string;
  sizes: string[];
  description: string;
};

const categories = [
  "T-Shirt",
  "Dress",
  "Pants",
  "Shoes",
  "Bags",
  "Accessories",
];

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

const initialForm: ProductForm = {
  name: "",
  price: "",
  image: "",
  category: "T-Shirt",
  stock: "",
  sizes: [],
  description: "",
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productData: Product[] = snapshot.docs.map((productDoc) => {
          const data = productDoc.data();

          return {
            id: productDoc.id,
            name: data.name || "",
            price: Number(data.price) || 0,
            image: data.image || "",
            category: data.category || "T-Shirt",
            stock: Number(data.stock) || 0,
            sizes: Array.isArray(data.sizes) ? data.sizes : [],
            description: data.description || "",
            createdAt: data.createdAt,
          };
        });

        setProducts(productData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading products:", error);
        setLoading(false);
        setMessage("Products could not be loaded.");
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!productToDelete) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deletingId) {
        setProductToDelete(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [productToDelete, deletingId]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const totalStock = useMemo(() => {
    return products.reduce((total, product) => total + product.stock, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (product) => product.stock > 0 && product.stock <= 5
    ).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((product) => product.stock === 0).length;
  }, [products]);

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSizeChange = (size: string) => {
    setForm((previousForm) => {
      const sizeAlreadySelected = previousForm.sizes.includes(size);

      return {
        ...previousForm,
        sizes: sizeAlreadySelected
          ? previousForm.sizes.filter((selectedSize) => selectedSize !== size)
          : [...previousForm.sizes, size],
      };
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingProductId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setForm(initialForm);
    setEditingProductId(null);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (product: Product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      image: product.image,
      category: product.category,
      stock: String(product.stock),
      sizes: product.sizes || [],
      description: product.description || "",
    });

    setEditingProductId(product.id);
    setShowForm(true);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setMessage("Please choose a valid image file.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setMessage("Image must be smaller than 5 MB.");
    return;
  }

  setUploadingImage(true);
  setMessage("");

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

    setForm((previousForm) => ({
      ...previousForm,
      image: result.secure_url,
    }));

    setMessage("Image uploaded successfully.");
  } catch (error) {
    console.error("Image upload error:", error);
    setMessage("Image could not be uploaded. Please try again.");
  } finally {
    setUploadingImage(false);
    event.target.value = "";
  }
};

  const validateForm = () => {
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setMessage("Please enter the product name.");
      return false;
    }

    if (!form.image.trim()) {
      setMessage("Please enter the product image URL.");
      return false;
    }

    if (!form.category) {
      setMessage("Please select a product category.");
      return false;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setMessage("Please enter a valid product price.");
      return false;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setMessage("Please enter a valid stock quantity.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    setMessage("");

    const productData = {
      name: form.name.trim(),
      price: Number(form.price),
      image: form.image.trim(),
      category: form.category,
      stock: Number(form.stock),
      sizes: form.sizes,
      description: form.description.trim(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), productData);
        setMessage("Product updated successfully.");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });

        setMessage("Product added successfully.");
      }

      setForm(initialForm);
      setEditingProductId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving product:", error);
      setMessage("Product could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setMessage("");
  };

  const closeDeleteModal = () => {
    if (deletingId) return;
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeletingId(productToDelete.id);
    setMessage("");

    try {
      await deleteDoc(doc(db, "products", productToDelete.id));

      if (editingProductId === productToDelete.id) {
        resetForm();
      }

      setMessage("Product deleted successfully.");
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage("Product could not be deleted.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStockClass = (stock: number) => {
    if (stock === 0) return "out-of-stock";
    if (stock <= 5) return "low-stock";
    return "in-stock";
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 5) return `Low Stock: ${stock}`;
    return `In Stock: ${stock}`;
  };

  return (
    <main className="admin-products-page">
      <section className="admin-products-container">
        <div className="admin-products-header">
          <div>
            <p className="admin-products-eyebrow">U-MAY CHANG ADMIN</p>
            <h1>Product Management</h1>
            <p className="admin-products-subtitle">
              Add, edit and manage all products in your store.
            </p>
          </div>

          <button
            type="button"
            className="add-product-button"
            onClick={showForm ? resetForm : openAddForm}
          >
            {showForm ? "Close Form" : "+ Add Product"}
          </button>
        </div>

        {message && <div className="admin-products-message">{message}</div>}

        <section className="product-summary-grid">
          <article className="product-summary-card">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </article>

          <article className="product-summary-card">
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
          </article>

          <article className="product-summary-card warning">
            <span>Low Stock</span>
            <strong>{lowStockCount}</strong>
          </article>

          <article className="product-summary-card danger">
            <span>Out of Stock</span>
            <strong>{outOfStockCount}</strong>
          </article>
        </section>

        {showForm && (
          <section className="product-form-card">
            <div className="product-form-heading">
              <div>
                <p className="form-label">
                  {editingProductId ? "EDIT PRODUCT" : "NEW PRODUCT"}
                </p>

                <h2>
                  {editingProductId
                    ? "Update Product Information"
                    : "Add a New Product"}
                </h2>
              </div>

              <button
                type="button"
                className="form-close-button"
                onClick={resetForm}
                aria-label="Close product form"
              >
                ×
              </button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <div className="product-form-grid">
                <div className="form-field">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Example: Korean Summer Dress"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <option value={category} key={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="price">Price — Baht *</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    step="1"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="Example: 299"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="stock">Stock Quantity *</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleInputChange}
                    placeholder="Example: 20"
                  />
                </div>

               <div className="form-field form-field-full">
  <label htmlFor="product-image-upload">Product Image *</label>

  <div className="image-upload-box">
    <input
      id="product-image-upload"
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      disabled={uploadingImage}
    />

    <label
      htmlFor="product-image-upload"
      className={`image-upload-label ${
        uploadingImage ? "uploading" : ""
      }`}
    >
      {uploadingImage
        ? "Uploading image..."
        : "📷 Choose Product Image"}
    </label>
  </div>

  {form.image && (
    <input
      type="url"
      value={form.image}
      readOnly
      className="uploaded-image-url"
    />
  )}
</div>

                <div className="form-field form-field-full">
                  <label>Available Sizes</label>

                  <div className="admin-size-options">
                    {availableSizes.map((size) => (
                      <button
                        type="button"
                        key={size}
                        className={`admin-size-button ${
                          form.sizes.includes(size) ? "selected" : ""
                        }`}
                        onClick={() => handleSizeChange(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <small>Sizes are optional for Bags and Accessories.</small>
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="description">Product Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Write a short product description..."
                    rows={4}
                  />
                </div>
              </div>

              {form.image && (
                <div className="product-image-preview">
                  <p>Image Preview</p>

                  <img
                    src={form.image}
                    alt="Product preview"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="product-form-actions">
                <button
                  type="button"
                  className="cancel-product-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProductId
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="product-toolbar">
          <div className="product-search-wrapper">
            <span>⌕</span>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search product name or category..."
            />
          </div>

          <select
            className="product-category-filter"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>
        </section>

        <div className="products-result-header">
          <h2>All Products</h2>

          <span>
            Showing {filteredProducts.length} of {products.length}
          </span>
        </div>

        {loading ? (
          <div className="admin-products-state">
            <div className="admin-products-spinner" />
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-products-state empty">
            <div className="empty-product-icon">📦</div>
            <h3>No products found</h3>
            <p>Add a new product or change the search and category filter.</p>
          </div>
        ) : (
          <section className="admin-product-grid">
            {filteredProducts.map((product) => (
              <article className="admin-product-card" key={product.id}>
                <div className="admin-product-image-wrapper">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="admin-product-image"
                    />
                  ) : (
                    <div className="admin-product-no-image">No Image</div>
                  )}

                  <span className="admin-product-category">
                    {product.category}
                  </span>

                  <span
                    className={`admin-product-stock ${getStockClass(
                      product.stock
                    )}`}
                  >
                    {getStockText(product.stock)}
                  </span>
                </div>

                <div className="admin-product-content">
                  <h3>{product.name}</h3>

                  <p className="admin-product-price">
                    ฿{product.price.toLocaleString()}
                  </p>

                  {product.description && (
                    <p className="admin-product-description">
                      {product.description}
                    </p>
                  )}

                  <div className="admin-product-sizes">
                    <span>Sizes:</span>

                    {product.sizes.length > 0 ? (
                      <div>
                        {product.sizes.map((size) => (
                          <small key={size}>{size}</small>
                        ))}
                      </div>
                    ) : (
                      <em>Not required</em>
                    )}
                  </div>

                  <div className="admin-product-actions">
                    <button
                      type="button"
                      className="edit-product-button"
                      onClick={() => openEditForm(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-product-button"
                      onClick={() => openDeleteModal(product)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      {productToDelete && (
        <div
          className="delete-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <section
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
          >
            <div className="delete-modal-icon">!</div>

            <h2 id="delete-product-title">Delete this product?</h2>

            <p>
              You are about to permanently delete
              <strong> “{productToDelete.name}”</strong>.
            </p>

            <div className="delete-modal-product">
              {productToDelete.image ? (
                <img
                  src={productToDelete.image}
                  alt={productToDelete.name}
                />
              ) : (
                <div className="delete-modal-no-image">No Image</div>
              )}

              <div>
                <strong>{productToDelete.name}</strong>
                <span>
                  {productToDelete.category} · ฿
                  {productToDelete.price.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="delete-modal-warning">
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-modal-confirm"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminProducts;
