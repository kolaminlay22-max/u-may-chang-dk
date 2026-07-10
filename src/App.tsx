import AdminProducts from "./components/AdminProducts";
import ProductDetails from "./components/ProductDetails";
import emailjs from "@emailjs/browser";
import TrackOrder from "./components/TrackOrder";
import { Routes, Route, useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./components/AdminOrders";
import Orders from "./components/Orders";
import CartSidebar from "./components/CartSidebar";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import { useEffect, useMemo, useState } from "react";
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
  deleteDoc,
  serverTimestamp,
  runTransaction,
  onSnapshot,
} from "firebase/firestore";

const categories = [
  "All",
  "T-Shirt",
  "Dress",
  "Pants",
  "Shoes",
  "Bags",
  "Accessories",
];

const generateOrderNumber = async () => {
  const now = new Date();

  const date =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const counterRef = doc(db, "counters", "orders");

  const newNumber = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    const lastNumber = counterDoc.exists()
      ? counterDoc.data().lastNumber || 0
      : 0;

    const nextNumber = lastNumber + 1;

    transaction.set(counterRef, {
      lastNumber: nextNumber,
    });

    return nextNumber;
  });

  return `UMC-${date}-${String(newNumber).padStart(3, "0")}`;
};

function App() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      const cartData = snapshot.docs.map((document) => ({
        ...document.data(),
        cartDocId: document.id,
      }));

      setCart(cartData);
    });

    return () => unsubscribe();
  }, []);

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

  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((item) => {
        const productName = String(item.name || "").toLowerCase();
        const keyword = search.toLowerCase();

        const matchesSearch = productName.includes(keyword);

        const matchesCategory =
          selectedCategory === "All" || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const priceA = Number(String(a.price).replace(/[^0-9]/g, ""));
        const priceB = Number(String(b.price).replace(/[^0-9]/g, ""));

        const stockA = Number(a.stock || 0);
        const stockB = Number(b.stock || 0);

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "stock-high") return stockB - stockA;
        if (sortBy === "name-az") {
          return String(a.name || "").localeCompare(String(b.name || ""));
        }

        return 0;
      });
  }, [products, search, selectedCategory, sortBy]);

  const addToCart = (item: any) => {
    const stock = Number(item.stock || 0);

    if (stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...prevCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }

      return [...prev, productId];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const increaseQuantity = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
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
    setWishlistIds([]);
  };

  const checkout = async () => {
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
      total,
      createdAt: serverTimestamp(),
      orderNumber,
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
        total,
      },
      "WyBv_VgU3aKpks0Xj"
    );

    for (const item of cart) {
      await deleteDoc(doc(db, "cart", item.cartDocId || item.id));
    }

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
              wishlistCount={wishlistIds.length}
onOpenWishlist={() => alert("Wishlist page coming soon 💜")}
              onSearchChange={setSearch}
              onLogin={signInWithGoogle}
              onLogout={logout}
              isCartOpen={isCartOpen}
              onToggleCart={() => setIsCartOpen(!isCartOpen)}
            />

            <Hero />

            <Orders />

            <div className="shop-controls">
              <div className="category-filter">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={
                      selectedCategory === category
                        ? "category-btn active"
                        : "category-btn"
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price Low → High</option>
                <option value="price-high">Price High → Low</option>
                <option value="stock-high">Stock High → Low</option>
                <option value="name-az">Name A → Z</option>
              </select>
            </div>

            <section className="products">
              {filteredProducts.map((item) => {
                const stock = Number(item.stock || 0);

                const isOutOfStock = stock <= 0;

                const isLowStock = stock > 0 && stock <= 5;

                const isFavorite = wishlistIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="product-card"
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="product-image-wrap">
                      <span className="new-badge">NEW</span>

                      <button
                        className="wishlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(item.id);
                        }}
                      >
                        {isFavorite ? "💜" : "🤍"}
                      </button>

                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    </div>

                    <div className="product-info">
                      <p className="product-category">
                        {item.category || "Fashion"}
                      </p>

                      <h3>{item.name}</h3>

                      <div className="rating">
                        ⭐⭐⭐⭐⭐
                        <span> (4.9)</span>
                      </div>

                      <p className="price">
                        {item.price} Baht
                      </p>

                      {isOutOfStock ? (
                        <p className="stock-badge out">
                          Out of Stock
                        </p>
                      ) : isLowStock ? (
                        <p className="stock-badge low">
                          Only {stock} left
                        </p>
                      ) : (
                        <p className="stock-badge in">
                          In Stock: {stock}
                        </p>
                      )}

                      <button
                        disabled={isOutOfStock}
                        className={
                          isOutOfStock
                            ? "disabled-btn"
                            : ""
                        }
                        onClick={(e) => {
                          e.stopPropagation();

                          if (!isOutOfStock) {
                            addToCart(item);
                          }
                        }}
                      >
                        {isOutOfStock
                          ? "Sold Out"
                          : "🛒 Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
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

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/orders"
        element={<AdminOrders />}
      />

      <Route
        path="/admin/products"
        element={<AdminProducts />}
      />

      <Route
        path="/product/:id"
        element={<ProductDetails />}
      />

      <Route
        path="/track-order"
        element={<TrackOrder />}
      />
    </Routes>
  );
}

export default App;