
 import "./LiveOrder.css";
 import { useState } from "react";
 type LiveOrderProduct = {
  id: string; 
  image?: string; 
  name: string;
  color?: string;
  price: number;
  regularPrice?: number;
  livePrice?: number;
  quantity?: number;
  size?: string;
};
 type LiveOrderProps = {
  customerName: string;
  customerPhone?: string;
customerTiktokUsername?: string;
customerAddress?: string;
customerCity?: string;
customerNote?: string;
availableProducts: {
  id: string;
  name: string;
  category?: string;
}[];
  products: LiveOrderProduct[];
  onImageUpload: (productId: string, file: File) => void;
  onImageRemove: (productId: string) => void;
  onColorChange: (productId: string, color: string) => void;
  onAddVariant: (productId: string) => void;
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  onPriceChange: (productId: string, newPrice: number) => void;
  onCompleteSale: (finalTotal: number) => void;
  onSelectProduct: (category: string) => void;
  onSizeChange: (productId: string, size: string) => void;
};
const LIVE_CATEGORIES = [
  "Dress",
  "T-Shirt",
  "Long Sleeve",
  "Pants",
  "Skirt",
  "Shorts",
  "Set",
  "Bag",
  "Shoes",
  "Accessories",
];
function LiveOrder({
  customerName,
  customerPhone,
customerTiktokUsername,
customerAddress,
customerCity,
customerNote,
  products,
  onIncrease,
  onDecrease,
  onRemove,
  onPriceChange,
  onSizeChange,
  onColorChange,
  onImageUpload,
  onImageRemove,
  onAddVariant,
  onCompleteSale,
  onSelectProduct,
}: LiveOrderProps) {
    const orderTotal = products.reduce(
  (total: number, product: LiveOrderProduct) =>
    total +
    (product.livePrice ?? product.price) *
      (product.quantity || 1),
  0
); 
const [discount, setDiscount] = useState(0);
const [discountType, setDiscountType] =
  useState<"amount" | "percent">("amount");

const discountAmount =
  discountType === "percent"
    ? (orderTotal * discount) / 100
    : discount;

const finalTotal = Math.max(orderTotal - discountAmount, 0);

  return (
    <section className="live-order-content">
     <div className="live-order-customer">
  <span className="live-order-customer-label">
    Current Customer
  </span>

  <strong className="live-order-customer-name">
    {customerName}
  </strong>
  {customerPhone && <p>📞 {customerPhone}</p>}

{customerTiktokUsername && (
  <p>🎵 @{customerTiktokUsername}</p>
)}

{customerAddress && (
  <p>📍 {customerAddress}</p>
)}

{customerCity && (
  <p>🏙 {customerCity}</p>
)}

{customerNote && (
  <p>📝 {customerNote}</p>
)}
</div>

      {products.length === 0 ? (
        <div className="live-order-empty">
          <div className="live-order-empty-icon">🛒</div>

          <h3>No products added</h3>

          <p>Add products to start the live order.</p>
        </div>
      ) : (
        <div className="live-order-products">
          <h3>Selected Products</h3>
          <select
  className="live-order-product-picker"
  onChange={(e) => {
    if (!e.target.value) return;

    onSelectProduct(e.target.value);
  }}
  defaultValue=""
>
  <option value="">Select Category</option>
 {LIVE_CATEGORIES.map((category) => (
  <option key={category} value={category}>
    {category}
  </option>

))}
</select>

        {products.map((product: LiveOrderProduct) => (
  <div
  key={product.id}
  className="live-order-product" 
>
    <div className="live-order-image">
  <img
  src={
  product.image ||
  "https://placehold.co/80x80?text=No+Image"
}
    alt={product.name}
  />
</div>
<div className="live-order-upload">
 <label
  htmlFor={`live-product-image-${product.id}`}
  className="live-order-upload-label"
>
  {product.image ? "🔄 Change Photo" : "📷 Choose Photo"}
</label>
{product.image && (
  <button
    type="button"
    className="live-order-remove-photo"
    onClick={() => onImageRemove(product.id)}
  >
    🗑 Remove Photo
  </button>
)}
  <input
    id={`live-product-image-${product.id}`}
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files?.[0];

      if (file) {
        onImageUpload(product.id, file);
      }

      event.target.value = "";
    }}
  />
</div>
  <div className="live-order-info">
    <div className="live-order-header">
  <span className="live-order-badge">
  Category
</span>

  <span className="live-order-id">
    #{product.id.slice(-4).toUpperCase()}
  </span>
</div>
    <div className="live-order-name">
      {product.name} 
    </div>
<div className="live-order-options">
  <div className="live-order-option">
    <span>Size</span>

    <select
      value={product.size || "Free Size"}
      onChange={(event) =>
        onSizeChange(product.id, event.target.value)
      }
    >
      <option value="Free Size">Free Size</option>
      <option value="S">S</option>
      <option value="M">M</option>
      <option value="L">L</option>
      <option value="XL">XL</option>
      <option value="2XL">2XL</option>
    </select>
  </div>

  <div className="live-order-option">
    <span>Color</span>

    <select
      value={product.color || ""}
      onChange={(event) =>
        onColorChange(product.id, event.target.value)
      }
    >
      <option value="">No Color</option>
      <option value="Black">Black</option>
      <option value="White">White</option>
      <option value="Pink">Pink</option>
      <option value="Blue">Blue</option>
      <option value="Red">Red</option>
      <option value="Green">Green</option>
      <option value="Purple">Purple</option>
      <option value="Yellow">Yellow</option>
    </select>
  </div>
</div>
  <div className="live-order-price">
  <span>Price</span>

  <div className="live-order-price-input">
    <span>฿</span>

    <input
      type="number"
      value={
  (product.livePrice ?? product.price) === 0
    ? ""
    : product.livePrice ?? product.price
} 
placeholder="0"
   onChange={(e) => {
  const value: number =
  e.target.value === ""
    ? 0
    : parseInt(e.target.value, 10);
  onPriceChange(product.id, value);
}}
    />
  </div>

  <small className="live-order-line-total">
    Total: ฿
    {(product.livePrice ?? product.price) *
      (product.quantity || 1)}
  </small>
</div>
  </div>

  <div className="live-order-controls">
  <button
    type="button"
    onClick={() => onDecrease(product.id)}
  >
    −
  </button>

  <span>{product.quantity || 1}</span>
  

  <button
    type="button"
    onClick={() => onIncrease(product.id)}
  >
    +
  </button>
</div>

<div className="live-order-buttons">
  <button
    type="button"
    className="live-order-remove"
    onClick={() => onRemove(product.id)}
  >
    Remove
  </button>

  <button
    type="button"
    className="live-order-add-variant"
    onClick={() => onAddVariant(product.id)}
  >
    + Add Another Size / Color
  </button>
</div>
  </div>

))} 
<hr />

<div className="live-order-grand-total">
  <span>Order Total</span>
  <strong>฿{orderTotal}</strong>
</div>
<div className="live-order-discount-type">
  <button
  type="button"
  className={discountType === "amount" ? "active" : ""}
  onClick={() => setDiscountType("amount")}
> 
  ฿
</button>

<button
  type="button"
  className={discountType === "percent" ? "active" : ""}
  onClick={() => setDiscountType("percent")}
>
  %
</button>
</div>
<div className="live-order-discount">
  <span>Discount</span>

  <input
  type="number"
  min="0"
  max={discountType === "percent" ? 100 : undefined}
  value={discount === 0 ? "" : discount}
  placeholder="0"
  onChange={(e) =>
    setDiscount(e.target.value === "" ? 0 : Number(e.target.value))
  }
/>
</div>

<div className="live-order-grand-total final">
  <span>Grand Total</span>
  <strong>฿{finalTotal}</strong>
</div>
<div className="live-order-actions">
  <button
  type="button"
  className="live-complete-sale-btn"
  onClick={() => onCompleteSale(finalTotal)}
>
  ✅ Complete Sale
</button>
</div>
      </div>
      )}
    </section>
  );
}

export default LiveOrder;