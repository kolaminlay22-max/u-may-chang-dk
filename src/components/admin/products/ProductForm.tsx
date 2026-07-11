import type { ChangeEvent, FormEvent } from "react";

import {
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
} from "../../../types/product";

import type {
  ProductCategory,
  ProductSize,
} from "../../../types/product";

export type ProductFormState = {
  name: string;
  price: string;
  image: string;
  category: ProductCategory;
  stock: string;
  sizes: ProductSize[];
  description: string;
};

type ProductFormProps = {
  form: ProductFormState;
  editingProductId: string | null;
  saving: boolean;
  uploadingImage: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onInputChange: (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => void;
  onSizeChange: (size: ProductSize) => void;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
};

function ProductForm({
  form,
  editingProductId,
  saving,
  uploadingImage,
  onSubmit,
  onInputChange,
  onSizeChange,
  onImageUpload,
  onCancel,
}: ProductFormProps) {
  return (
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
          onClick={onCancel}
          aria-label="Close product form"
        >
          ×
        </button>
      </div>

      <form className="product-form" onSubmit={onSubmit}>
        <div className="product-form-grid">
          <div className="form-field">
            <label htmlFor="name">Product Name *</label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={onInputChange}
              placeholder="Example: Korean Summer Dress"
            />
          </div>

          <div className="form-field">
            <label htmlFor="category">Category *</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={onInputChange}
            >
              {PRODUCT_CATEGORIES.map((category) => (
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
              onChange={onInputChange}
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
              onChange={onInputChange}
              placeholder="Example: 20"
            />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="product-image-upload">
              Product Image *
            </label>

            <div className="image-upload-box">
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                onChange={onImageUpload}
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
              {PRODUCT_SIZES.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={`admin-size-button ${
                    form.sizes.includes(size) ? "selected" : ""
                  }`}
                  onClick={() => onSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <small>
              Sizes are optional for Bags and Accessories.
            </small>
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="description">
              Product Description
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={onInputChange}
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
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-product-button"
            disabled={saving || uploadingImage}
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
  );
}

export default ProductForm;