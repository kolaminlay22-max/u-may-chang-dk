 import { useState } from "react";
import "./CheckoutModal.css";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  onPlaceOrder: (checkoutData: CheckoutData) => void;
};
type CheckoutData = {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  postalCode: string;
  paymentMethod: string;
  district: string;
deliveryNote: string;
};
function CheckoutModal({
  open,
  onClose,
  onPlaceOrder,
}: CheckoutModalProps) {
  if (!open) return null; 
  const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [province, setProvince] = useState("");
const [postalCode, setPostalCode] = useState("");
const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
const [district, setDistrict] = useState("");
const [deliveryNote, setDeliveryNote] = useState("");
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
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
/>

          <label>Phone Number</label>
          <input
  type="tel"
  placeholder="08xxxxxxxx"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>

          <label>Address</label>
          <textarea
  rows={3}
  placeholder="House No, Street..."
  value={address}
  onChange={(e) => setAddress(e.target.value)}
/>

          <label>Province</label>
          <input
  type="text"
  placeholder="Bangkok"
  value={province}
  onChange={(e) => setProvince(e.target.value)}
/>
     <label>District</label>
<input
  type="text"
  placeholder="Sai Mai"
  value={district}
  onChange={(e) => setDistrict(e.target.value)}
/>
<label>Postal Code</label>
<input
  type="text"
  inputMode="numeric"
  placeholder="11000"
  value={postalCode}
  onChange={(e) => setPostalCode(e.target.value)}
/>
         <label>Delivery Note</label>
<textarea
  rows={2}
  placeholder="Optional..."
  value={deliveryNote}
  onChange={(e) => setDeliveryNote(e.target.value)}
/>

          <label>Payment Method</label>

         <select
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
>
  <option value="Cash on Delivery">Cash on Delivery</option>
  <option value="Bank Transfer">Bank Transfer</option>
  <option value="PromptPay">PromptPay</option>
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
            onClick={() =>
 onPlaceOrder({
  fullName,
  phone,
  address,
  province,
  district,
  postalCode,
  deliveryNote,
  paymentMethod,
})
}
          >
            Place Order
          </button>

        </div>

      </div>
    </div>
  );
}

export default CheckoutModal;