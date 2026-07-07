import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
const updateStatus = async (id: string, status: string) => {
  const orderRef = doc(db, "orders", id);

  await updateDoc(orderRef, {
    status,
  });

  setOrders((prev: any[]) =>
    prev.map((order: any) =>
      order.id === id ? { ...order, status } : order
    )
  );
};
  useEffect(() => {
    const loadOrders = async () => {
    const q = query(
  collection(db, "orders"),
  orderBy("createdAt", "desc")
);

const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    };

    loadOrders();
  }, []);

  return (
<div className="orders-container">
      <h2>My Orders</h2>

      {orders.map((order) => (
  <div key={order.id} className="order-card">

    <h3>Total : {order.total} Baht</h3>
<p>
 <strong>Order No:</strong> {order.orderNumber || order.id}
</p>

<p>
  <strong>Date:</strong>{" "}
  {order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
    : "No Date"}
</p>
<p>
  <strong>Status:</strong> {order.status || "Pending"}
</p>

<button onClick={() => updateStatus(order.id, "Completed")}>
  Mark Completed
</button>
    <p>{order.userName}</p>

    {order.items?.map((item: any, index: number) => (
      <div key={index}>
       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
  }}
>
  <img
    src={new URL(`../assets/${item.image}`, import.meta.url).href}
    alt={item.name}
    style={{
      width: "70px",
      height: "70px",
      objectFit: "cover",
      borderRadius: "10px",
    }}
  />

  <div>
    <h4>{item.name}</h4>
    <p>💰 Price : {item.price}</p>
    <p>📦 Quantity : {item.quantity}</p>
  </div>
</div>
      </div>
    ))}

    <hr />
  </div>
))}
    </div>
  );
}

export default Orders;