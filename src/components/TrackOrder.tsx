import { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { generateInvoice } from "../invoice";
function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Processing":
        return "#3b82f6";
      case "Shipped":
        return "#8b5cf6";
      case "Delivered":
      case "Completed":
        return "#22c55e";
      default:
        return "#9ca3af";
    }
  };

  const handleTrackOrder = async () => {
    const q = query(
      collection(db, "orders"),
      where("orderNumber", "==", orderId.trim())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      setOrder(null);
      setError("Order not found.");
      return;
    }

    setOrder(snapshot.docs[0].data());
    setError("");
  };

  const isDone = (step: string) => {
    const steps = ["Pending", "Processing", "Shipped", "Completed"];
    const current = order?.status === "Delivered" ? "Completed" : order?.status;
    return steps.indexOf(current) >= steps.indexOf(step);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center" }}>
      <h1>📦 Track Your Order</h1>
      <p>Enter your Order ID below.</p>

      <input
        type="text"
        placeholder="Example: UMC-260707-001"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleTrackOrder}
        style={{
          marginTop: "20px",
          padding: "12px 30px",
          borderRadius: "8px",
          border: "none",
          background: "#6C4CF1",
          color: "#fff",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Track Order
      </button>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {order && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            textAlign: "left",
          }}
        >
          <h2>Order Details</h2>
          <p><strong>Order Number:</strong> {order.orderNumber}</p>
          <p><strong>Customer:</strong> {order.userName}</p>

          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                background: getStatusColor(order.status),
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "20px",
                fontWeight: "bold",
              }}
            >
              {order.status}
            </span>
          </p>

          <p><strong>Date:</strong> {order.orderDate}</p>
          <p><strong>Time:</strong> {order.orderTime}</p>
          <p><strong>Total:</strong> {order.total} Baht</p>
<button
  onClick={() => generateInvoice(order)}
  style={{
    marginTop: "15px",
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Download Invoice
</button>
          <h3 style={{ marginTop: "20px" }}>Order Progress</h3>

          <div
            style={{
              borderLeft: "3px solid #22c55e",
              paddingLeft: "20px",
              marginLeft: "10px",
              marginBottom: "25px",
            }}
          >
            {["Pending", "Processing", "Shipped", "Completed"].map((step) => (
              <div
                key={step}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: isDone(step) ? "#22c55e" : "#d1d5db",
                    marginLeft: "-30px",
                  }}
                />
                <span>{step === "Pending" ? "Order Placed" : step}</span>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "20px" }}>Products</h3>

          {order.items?.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "10px",
                marginTop: "10px",
              }}
            >
              <img
                src={`/src/assets/${item.image}`}
                alt={item.name}
                style={{
                  width: "70px",
                  height: "90px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />

              <div>
                <p><strong>{item.name}</strong></p>
                <p>Price: {item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackOrder;