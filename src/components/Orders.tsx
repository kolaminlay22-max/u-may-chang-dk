import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./Orders.css";

const trackingSteps = [
  "Pending",
  "Confirmed",
  "Packing",
  "Shipped",
  "Delivered",
];

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

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

      {orders.map((order) => {
        const fixedStatus =
          order.status === "Completed"
            ? "Delivered"
            : order.status || "Pending";

        const currentIndex = trackingSteps.indexOf(fixedStatus);

        return (
          <div key={order.id} className="order-card">

            {/* Brand */}
            <div className="order-brand">
              <div>
                <h3>🛍️ U-May Chang</h3>
                <p>Premium Fashion Store</p>
              </div>

              <span
                className={`status-badge ${
                  fixedStatus === "Delivered"
                    ? "completed"
                    : "pending"
                }`}
              >
                {order.status || "Pending"}
              </span>
            </div>

            {/* Order Info */}
            <div className="order-info-grid">

              <div>
                <span>Order ID</span>
                <strong>
                  #{order.orderNumber || order.id}
                </strong>
              </div>

              <div>
                <span>Customer</span>
                <strong>👤 {order.userName}</strong>
              </div>

              <div>
                <span>Date</span>
                <strong>
                  {order.createdAt?.seconds
                    ? new Date(
                        order.createdAt.seconds * 1000
                      ).toLocaleDateString()
                    : "No Date"}
                </strong>
              </div>

              <div>
                <span>Total</span>
                <strong>{order.total} Baht</strong>
              </div>

            </div>

            {/* Products */}
            {order.items?.map((item: any, index: number) => {

              const total =
                Number(item.price) * Number(item.quantity);

              return (

                <div
                  key={index}
                  className="order-product"
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="order-product-image"
                  />

                  <div className="order-product-info">

                    <h4>{item.name}</h4>

                    <p>
                      Price : {item.price} Baht
                    </p>

                    <p>
                      Qty : {item.quantity}
                    </p>

                  </div>

                  <div className="product-total">

                    <span>Total</span>

                    <strong>
                      {total} Baht
                    </strong>

                  </div>

                </div>

              );

            })}

            {/* Tracking */}

            <div className="order-tracking">

              {trackingSteps.map((step, index) => (

                <div
                  key={step}
                  className={`tracking-step ${
                    index <= currentIndex
                      ? "active"
                      : ""
                  }`}
                >

                  <span className="tracking-dot"></span>

                  <p>{step}</p>

                </div>

              ))}

            </div>

            {/* Footer */}

            <div className="order-footer">
              Thank you for shopping with U-May Chang
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default Orders;