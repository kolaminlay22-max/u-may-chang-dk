import { useEffect, useState } from "react";
import { generateInvoice } from "../invoice";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const statusSteps = ["Pending", "Packing", "Shipped", "Delivered"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "#f59e0b";
      case "Packing":
        return "#3b82f6";
      case "Shipped":
        return "#8b5cf6";
      case "Completed":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => (order.status || "Pending") === "Pending"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;
  const totalRevenue = orders
    .filter((order) => order.status === "Delivered")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  useEffect(() => {
    const loadOrders = async () => {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setOrders(data);
    };

    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, "orders", orderId), { status });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order?")) return;

    await deleteDoc(doc(db, "orders", orderId));
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = searchTerm.toLowerCase();

    return (
      order.userName?.toLowerCase().includes(keyword) ||
      order.userEmail?.toLowerCase().includes(keyword) ||
      order.status?.toLowerCase().includes(keyword) ||
      order.orderNumber?.toLowerCase().includes(keyword) ||
      order.id?.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <div className="admin-orders">
        <h1>🧾 Admin Orders</h1>

        <input
          type="text"
          placeholder="Search by name, email, status, order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "12px",
            width: "100%",
            maxWidth: "420px",
            marginBottom: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          {[
            ["📦", "Total Orders", totalOrders],
            ["🟡", "Pending", pendingOrders],
            ["🟢", "Delivered", deliveredOrders],
            ["💰", "Revenue", `${totalRevenue} Baht`],
          ].map((card, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}
            >
              <h3>
                {card[0]} {card[1]}
              </h3>
              <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                {card[2]}
              </p>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: "18px",
                padding: "25px",
                marginBottom: "25px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  marginBottom: "15px",
                  fontSize: "28px",
                  color: "#5b3df5",
                  textAlign: "center",
                }}
              >
                👤 {order.userName}
              </h3>

              <p style={{ margin: "6px 0", fontSize: "18px" }}>
                📄 Order No: {order.orderNumber || order.id}
              </p>
              <p style={{ margin: "6px 0", fontSize: "18px" }}>
                📧 Email: {order.userEmail}
              </p>
              <p style={{ margin: "6px 0", fontSize: "18px" }}>
                📅 Date: {order.orderDate || "No date"}
              </p>
              <p style={{ margin: "6px 0", fontSize: "18px" }}>
                🕒 Time: {order.orderTime || "No time"}
              </p>
              <p style={{ margin: "6px 0", fontSize: "18px" }}>
                Total: {order.total} Baht
              </p>

              <p
                style={{
                  margin: "15px 0",
                  fontSize: "18px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                Status:{" "}
                <select
                  value={order.status || "Pending"}
                  onChange={(e) =>
                    updateOrderStatus(order.id, e.target.value)
                  }
                  style={{
                    background: getStatusColor(order.status || "Pending"),
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: "bold",
                  }}
                >
                  <option value="Pending">Pending</option>
<option value="Processing">Processing</option>
<option value="Shipped">Shipped</option>
<option value="Completed">Completed</option>
                </select>
              </p>

              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button onClick={() => deleteOrder(order.id)}>Delete</button>

                <button onClick={() => setSelectedOrder(order)}>
                  View Details
                </button>

                <button
                  onClick={() => generateInvoice(order)}
                  style={{ marginLeft: "10px" }}
                >
                  Download Invoice
                </button>
              </div>

              <h4>Products</h4>
              {order.items?.map((item: any, index: number) => (
                <div key={index}>
                  {item.name} × {item.quantity}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "680px",
              background: "white",
              borderRadius: "22px",
              padding: "30px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "#666",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                background: "linear-gradient(135deg,#6d5dfc,#8b5cf6)",
                color: "white",
                padding: "25px",
                borderRadius: "18px",
                marginBottom: "25px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "34px" }}>
                📦 Order Details
              </h2>

              <p style={{ marginTop: "12px", fontSize: "20px" }}>
                <strong>Order No:</strong>{" "}
                {selectedOrder.orderNumber || selectedOrder.id}
              </p>

              <span
                style={{
                  background: "white",
                  color: "#6d5dfc",
                  padding: "8px 18px",
                  borderRadius: "30px",
                  fontWeight: "bold",
                  display: "inline-block",
                  marginTop: "8px",
                }}
              >
                {selectedOrder.status || "Pending"}
              </span>
            </div>

            <div
              style={{
                background: "#f8f9ff",
                borderRadius: "18px",
                padding: "20px",
                marginTop: "25px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3>👤 Customer</h3>
              <p>
                <b>Name:</b> {selectedOrder.userName}
              </p>
              <p>
                <b>Email:</b> {selectedOrder.userEmail}
              </p>
              <p>
                <b>Phone:</b> {selectedOrder.phone || "Not set"}
              </p>
            </div>

            <div
              style={{
                background: "#f8f9ff",
                borderRadius: "18px",
                padding: "20px",
                marginTop: "25px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3>💳 Payment</h3>
              <p>
                <b>Method:</b>{" "}
                {selectedOrder.paymentMethod || "Cash on Delivery"}
              </p>
              <p>
                <b>Payment Status:</b>{" "}
                {selectedOrder.paymentStatus || "Unpaid"}
              </p>
            </div>

            <div
              style={{
                background: "#f8f9ff",
                borderRadius: "18px",
                padding: "20px",
                marginTop: "25px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3>📍 Shipping Address</h3>
              <p>{selectedOrder.shippingAddress || "Not set"}</p>
            </div>

            <div
              style={{
                background: "#f8f9ff",
                borderRadius: "18px",
                padding: "20px",
                marginTop: "25px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3>🕒 Timeline</h3>
              {statusSteps.map((step) => (
                <p key={step}>
                  {statusSteps.indexOf(step) <=
                  statusSteps.indexOf(selectedOrder.status || "Pending")
                    ? "✅"
                    : "⚪"}{" "}
                  {step}
                </p>
              ))}
            </div>

            <div
              style={{
                background: "#f8f9ff",
                borderRadius: "18px",
                padding: "20px",
                marginTop: "25px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <h3>🛍 Products</h3>
              {selectedOrder.items?.map((item: any, index: number) => (
                <p key={index}>
                  {item.name} × {item.quantity}
                </p>
              ))}

              <h3>💰 Total: {selectedOrder.total} Baht</h3>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                borderRadius: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminOrders;