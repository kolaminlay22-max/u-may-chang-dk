
import "./BrandCard.css";

export type BrandCardItem = {
  name: string;
  quantity: number;
  price: number;
  livePrice?: number;
  regularPrice?: number;
  size?: string;
  color?: string;
  image?: string;
};

export type BrandCardOrder = {
  customerName: string;
  tiktokUsername?: string;
  channel?: string;
  status?: string;
  orderNumber?: string;
  createdAt?: any;
  items: BrandCardItem[];
  total: number;
    subtotal?: number;
  discount?: number;
  discountType?: "amount" | "percent";
  discountAmount?: number;
};

type BrandCardProps = {
  order: BrandCardOrder;
};


function BrandCard({ order }: BrandCardProps) {
 const subtotal =
  order.subtotal ??
  order.items.reduce((total, item) => {
    const price = Number(item.livePrice ?? item.price);
    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

const itemSavings = order.items.reduce((total, item) => {
  const regular = Number(item.regularPrice ?? item.price);
  const live = Number(item.livePrice ?? item.price);
  const quantity = Number(item.quantity || 1);

  return total + Math.max(regular - live, 0) * quantity;
}, 0);

const orderDiscountAmount =
  order.discountAmount ??
  (order.discountType === "percent"
    ? (subtotal * Number(order.discount || 0)) / 100
    : Number(order.discount || 0));

const totalSaved = itemSavings + orderDiscountAmount;

return (
    <div className="brand-card">
      <header className="brand-card-header">
        <span className="brand-card-logo">U-MAY CHANG</span>

        <h1>Live Sale Receipt</h1>

        <p>Live Exclusive Price</p>
      </header>
<div className="brand-card-meta">
  <div>
    <strong>Order ID:</strong>{" "}
{order.orderNumber || "UMC-260714-0001"}
  </div>

  <div>
    <strong>Date:</strong>{" "}
{(() => {
  const date = order.createdAt?.toDate
    ? order.createdAt.toDate()
    : order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  return date.toLocaleDateString("en-GB");
})()}
  </div>
</div>
      <section className="brand-card-customer">
        <div className="brand-card-avatar">
          {order.customerName?.trim().charAt(0).toUpperCase() || "C"}
        </div>

        <div>
 <div className="brand-card-customer-name">
  {order.customerName || "Customer"}
  
</div>

          <p>{order.tiktokUsername || "No social username"}</p>

          <span>{order.channel || "Live Sale"}</span>
        </div>
      </section>

      <section className="brand-card-status">
        <span>Order Status</span>

        <strong>{order.status || "Completed"}</strong>
      </section>

      <section className="brand-card-products">
        <div className="brand-card-table-header">
          <span>Product</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
        </div>

        {order.items.map((item, index) => (
          <div className="brand-card-product-row" key={`${item.name}-${index}`}>
            {item.image && (
  <img
    src={item.image}
    alt={item.name}
    className="brand-card-product-image"
    crossOrigin="anonymous"
  />
)}
            <div>
              
              <strong>{item.name}</strong>
              {item.regularPrice &&
 item.livePrice &&
 item.regularPrice > item.livePrice && (
  <small>
    <s>฿{Number(item.regularPrice).toLocaleString()}</s>
    {" → "}
    <strong style={{ color: "#7c3aed" }}>
      ฿{Number(item.livePrice).toLocaleString()}
    </strong>
  </small>
)}

              {(item.size || item.color) && (
                <small>
                  {[item.size, item.color].filter(Boolean).join(" • ")}
                </small>
              )}
            </div>

            <span>{item.quantity}</span>

            <span>
  ฿{Number(item.livePrice ?? item.price).toLocaleString()}
</span>

            <span>
              ฿
              {(
            Number(item.livePrice ?? item.price) *
Number(item.quantity)
              ).toLocaleString()}
            </span>
          </div>
        ))}
      </section>
      <section className="brand-card-summary">
  <div>
    <span>Subtotal</span>
    <strong>฿{subtotal.toLocaleString()}</strong>
  </div>

  {orderDiscountAmount > 0 && (
    <div className="discount">
      <span>
        Discount
        {order.discountType === "percent" && order.discount
          ? ` (${order.discount}%)`
          : ""}
      </span>

      <strong>-฿{orderDiscountAmount.toLocaleString()}</strong>
    </div>
  )}

  {totalSaved > 0 && (
    <div className="saved">
      <span>You Saved 💜</span>
      <strong>฿{totalSaved.toLocaleString()}</strong>
    </div>
  )}
</section>

      <section className="brand-card-total">
        <span>Grand Total</span>

 <strong>
  ฿{Number(order.total ?? 0).toLocaleString()}
</strong>
 </section>
      <footer className="brand-card-footer">
        <h3>Thank you 💜</h3>

        <p>See you again in our next LIVE</p>

        <div>
          <span>TikTok @umaychang</span>
          <span>Facebook U-May Chang</span>
          <span>www.umaychang.com</span>
        </div>
      </footer>
    </div>
  );
}

export default BrandCard;