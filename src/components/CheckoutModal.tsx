import "./CheckoutModal.css";
type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  onPlaceOrder: () => void;
};

function CheckoutModal({
  open,
  onClose,
  onPlaceOrder,
}: CheckoutModalProps) {
  if (!open) return null;

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">

        <div className="checkout-header">
          <h2>📦 Checkout</h2>

          <button
            className="checkout-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="checkout-form">

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
          />

          <label>Phone Number</label>
          <input
            type="text"
            placeholder="08xxxxxxxx"
          />

          <label>Address</label>
          <textarea
            rows={3}
            placeholder="House No, Street..."
          />

          <label>Province</label>
          <input
            type="text"
            placeholder="Bangkok"
          />

          <label>District</label>
          <input
            type="text"
            placeholder="Sai Mai"
          />

          <label>Delivery Note</label>
          <textarea
            rows={2}
            placeholder="Optional..."
          />

          <label>Payment Method</label>

          <select>
            <option>Cash on Delivery</option>
            <option>Bank Transfer</option>
            <option>PromptPay</option>
          </select>

        </div>

        <div className="checkout-footer">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="place-order-btn"
            onClick={onPlaceOrder}
          >
            Place Order
          </button>

        </div>

      </div>
    </div>
  );
}

export default CheckoutModal;