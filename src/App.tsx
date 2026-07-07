import emailjs from "@emailjs/browser";
import TrackOrder from "./components/TrackOrder";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./components/AdminOrders";
import Orders from "./components/Orders";
import CartSidebar from "./components/CartSidebar";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import { useState, useEffect } from "react";
import "./App.css";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import type { User } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

const generateOrderNumber = async () => {
  const now = new Date();

  const date =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const counterRef = doc(db, "counters", "orders");

  const newNumber = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    let lastNumber = 0;

    if (counterDoc.exists()) {
      lastNumber = counterDoc.data().lastNumber || 0;
    }

    const nextNumber = lastNumber + 1;

    transaction.set(counterRef, { lastNumber: nextNumber });

    return nextNumber;
  });

  return `UMC-${date}-${String(newNumber).padStart(3, "0")}`;
};

function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
const [isCartOpen, setIsCartOpen] = useState(false);
  useEffect(() => {
    const loadProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));

      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setProducts(data);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );
const addToCart = (item: any) => {
  setCart((prevCart) => {
    const existingItem = prevCart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
      return prevCart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    }

    return [...prevCart, { ...item, quantity: 1 }];
  });
};
 const removeFromCart = (index: number) => {
  setCart((prevCart) =>
    prevCart.filter((_, i) => i !== index)
  );
};
const increaseQuantity = (id: string) => {
  setCart((prevCart) =>
    prevCart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
};
const decreaseQuantity = (id: string) => {
  setCart((prevCart) =>
    prevCart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      });

      setUser(result.user);
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setCart([]);
  };
const checkout = async () => {
  console.log("checkout clicked");
if (!user) {
  alert("Please login first");
  return;
}
if (cart.length === 0) {
  alert("Your cart is empty");
  return;
}
const total = cart.reduce((sum, item) => {
  const price = Number(String(item.price).replace(/[^0-9]/g, ""));
  return sum + price * item.quantity;
}, 0);
const orderNumber = await generateOrderNumber();
await addDoc(collection(db, "orders"), {
  
  userId: user.uid,
  userName: user.displayName,
  userEmail: user.email,
  items: cart,
  total: total,
  createdAt: serverTimestamp(),
  orderNumber: orderNumber,
  orderDate: new Date().toLocaleDateString(),
orderTime: new Date().toLocaleTimeString(),
  status: "Pending",
});
await emailjs.send(
  "service_dk3vtxo",
  "template_gsxp8yi",
  {
    order_id: orderNumber,
    email: user.email,
    name: user.displayName,
    total: total,
  },
  "WyBv_VgU3aKpks0Xj"
);
alert("Order placed successfully");
setCart([]);
setIsCartOpen(false);
};
 return (
  <Routes>
    <Route
      path="/"
      element={
        <div className="app">
          <Navbar
            user={user}
            search={search}
            cartCount={cart.length}
            onSearchChange={setSearch}
            onLogin={signInWithGoogle}
            onLogout={logout}
            isCartOpen={isCartOpen}
            onToggleCart={() => setIsCartOpen(!isCartOpen)}
          />

          <Hero />

          <Orders />

          <section className="products">
            {filteredProducts.map((item) => (
              <div className="product-card" key={item.id}>
                <img
                  src={new URL(
                    `./assets/${item.image}`,
                    import.meta.url
                  ).href}
                  alt={item.name}
                />

                <h3>{item.name}</h3>
                <p className="price">{item.price}</p>

                <button onClick={() => addToCart(item)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </section>

          {isCartOpen && (
            <CartSidebar
              cart={cart}
              onClose={() => setIsCartOpen(false)}
              onRemove={removeFromCart}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onCheckout={checkout}
            />
          )}
        </div>
      }
    />

    <Route path="/admin" element={<AdminDashboard />} />
  <Route
  path="/admin/orders"
  element={<AdminOrders />}
/>
<Route path="/track-order" element={<TrackOrder />} />
  </Routes>
);
}

export default App;