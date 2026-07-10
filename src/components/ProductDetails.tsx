import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

type Product = {
  id: string;
  name: string;
  price: number | string;
  image: string;
  image2?: string;
  image3?: string;
  image4?: string;
  category?: string;
  stock?: number;
  sizes?: string[];
  colors?: Array<{ name: string; value: string }>;
  description?: string;
  material?: string;
  fit?: string;
  madeIn?: string;
  delivery?: string;
};

const fallbackColors = [
  { name: "Black", value: "#111827" },
  { name: "White", value: "#ffffff" },
  { name: "Purple", value: "#6D4AFF" },
  { name: "Red", value: "#EF4444" },
];

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      setProduct(null);
      setRelatedProducts([]);
      setQuantity(1);
      setSelectedSize("");
      setSelectedColor("");
      setMainImage("");
      setIsWishlisted(false);

      try {
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          setProduct(null);
          return;
        }

        const productData = {
          id: productSnap.id,
          ...productSnap.data(),
        } as Product;

        setProduct(productData);
        setMainImage(productData.image || "");

        const firstAvailableSize =
          Array.isArray(productData.sizes) && productData.sizes.length > 0
            ? productData.sizes[0]
            : "";

        const productColors =
          Array.isArray(productData.colors) && productData.colors.length > 0
            ? productData.colors
            : fallbackColors;

        setSelectedSize(firstAvailableSize);
        setSelectedColor(productColors[0]?.name || "");
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product) return;

      try {
        const relatedQuery = product.category
          ? query(
              collection(db, "products"),
              where("category", "==", product.category),
              limit(5)
            )
          : query(collection(db, "products"), limit(5));

        const relatedSnapshot = await getDocs(relatedQuery);

        const relatedData = relatedSnapshot.docs
          .map(
            (document) =>
              ({
                id: document.id,
                ...document.data(),
              }) as Product
          )
          .filter((item) => item.id !== product.id)
          .slice(0, 4);

        setRelatedProducts(relatedData);
      } catch (error) {
        console.error("Error loading related products:", error);
        setRelatedProducts([]);
      }
    };

    loadRelatedProducts();
  }, [product]);

  const productImages = useMemo(() => {
    if (!product) return [];

    return [product.image, product.image2, product.image3, product.image4].filter(
      (image): image is string => Boolean(image)
    );
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product || !Array.isArray(product.sizes)) return [];
    return product.sizes.filter(Boolean);
  }, [product]);

  const availableColors = useMemo(() => {
    if (product && Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors;
    }

    return fallbackColors;
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return false;

    const stock = Number(product.stock || 0);

    if (stock <= 0) {
      alert("This product is out of stock.");
      return false;
    }

    if (quantity > stock) {
      alert(`Only ${stock} item(s) available.`);
      return false;
    }

    if (availableSizes.length > 0 && !selectedSize) {
      alert("Please select a size.");
      return false;
    }

    if (availableColors.length > 0 && !selectedColor) {
      alert("Please select a color.");
      return false;
    }

    try {
      const cartQuery = query(
        collection(db, "cart"),
        where("id", "==", product.id),
        where("selectedSize", "==", selectedSize),
        where("selectedColor", "==", selectedColor)
      );

      const cartSnapshot = await getDocs(cartQuery);

      if (!cartSnapshot.empty) {
        const existingCartDoc = cartSnapshot.docs[0];
        const existingQuantity = Number(existingCartDoc.data().quantity || 1);

        if (existingQuantity + quantity > stock) {
          alert(
            `You already have ${existingQuantity} in your cart. Only ${stock} item(s) are available.`
          );
          return false;
        }

        await updateDoc(doc(db, "cart", existingCartDoc.id), {
          quantity: existingQuantity + quantity,
        });
      } else {
        await addDoc(collection(db, "cart"), {
          ...product,
          quantity,
          selectedSize,
          selectedColor,
          createdAt: serverTimestamp(),
        });
      }

      alert("Added to Cart!");
      return true;
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Could not add product to cart.");
      return false;
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) alert("Item added. Please open cart to checkout.");
  };

  const handleShare = async () => {
    const productUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(productUrl);
      alert("Product link copied!");
    } catch {
      alert(productUrl);
    }
  };

  if (loading) {
    return <h2 style={{ padding: "40px" }}>Loading...</h2>;
  }

  if (!product) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Product not found.</h2>
        <button onClick={() => navigate("/")}>Back to Shop</button>
      </div>
    );
  }

  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div className="product-details-page">
      <button className="details-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="details-card">
        <div className="details-gallery">
          <div className="details-image-box zoom-image">
            <span className="new-badge">NEW</span>

            <button
              className="wishlist-btn details-wishlist-btn"
              onClick={() => setIsWishlisted((previous) => !previous)}
              aria-label={
                isWishlisted
                  ? "Remove product from wishlist"
                  : "Add product to wishlist"
              }
            >
              {isWishlisted ? "💜" : "🤍"}
            </button>

            <img src={mainImage || product.image} alt={product.name} />
          </div>

          {productImages.length > 1 && (
            <div className="thumbnail-row">
              {productImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={
                    mainImage === image ? "thumbnail-btn active" : "thumbnail-btn"
                  }
                  onClick={() => setMainImage(image)}
                  aria-label={`View ${product.name} image ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="details-info">
          <p className="product-category">{product.category || "Fashion"}</p>
          <h1>{product.name}</h1>

          <div className="rating">
            ⭐⭐⭐⭐⭐ <span>(4.9)</span>
          </div>

          <h2>{product.price} Baht</h2>

          {isOutOfStock ? (
            <p className="stock-badge out">Out of Stock</p>
          ) : isLowStock ? (
            <p className="stock-badge low">Only {stock} left</p>
          ) : (
            <p className="stock-badge in">In Stock: {stock}</p>
          )}

          <p className="details-description">
            {product.description || "Premium fashion item from U-May Chang."}
          </p>

          {availableSizes.length > 0 && (
            <div className="option-group">
              <h4>Size</h4>

              <div className="size-options">
                {availableSizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={
                      selectedSize === size ? "size-btn active" : "size-btn"
                    }
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <p className="selected-option-text">Selected: {selectedSize}</p>
            </div>
          )}

          <div className="option-group">
            <h4>Color</h4>

            <div className="color-options">
              {availableColors.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  className={
                    selectedColor === color.name
                      ? "color-btn active"
                      : "color-btn"
                  }
                  onClick={() => setSelectedColor(color.name)}
                  title={color.name}
                  aria-label={`Select ${color.name}`}
                >
                  <span style={{ background: color.value }} />
                </button>
              ))}
            </div>

            <p className="selected-option-text">Selected: {selectedColor}</p>
          </div>

          <div className="quantity-box">
            <button
              type="button"
              onClick={() =>
                quantity > 1 && setQuantity((previous) => previous - 1)
              }
              aria-label="Decrease quantity"
            >
              -
            </button>

            <strong>{quantity}</strong>

            <button
              type="button"
              onClick={() =>
                quantity < stock && setQuantity((previous) => previous + 1)
              }
              disabled={isOutOfStock || quantity >= stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="details-actions">
            <button
              type="button"
              className={
                isOutOfStock
                  ? "disabled-btn details-cart-btn"
                  : "details-cart-btn"
              }
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? "Sold Out" : "🛒 Add to Cart"}
            </button>

            <button
              type="button"
              className="buy-now-btn"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
            >
              ⚡ Buy Now
            </button>
          </div>

          <div className="details-extra-actions">
            <button type="button" onClick={handleShare}>
              🔗 Share
            </button>

            <button
              type="button"
              onClick={() => setIsWishlisted((previous) => !previous)}
            >
              {isWishlisted ? "💜 Wishlisted" : "🤍 Add Wishlist"}
            </button>
          </div>

          <div className="trust-box">
            <p>🚚 Free Shipping Available</p>
            <p>🔒 Secure Checkout</p>
            <p>↩ 7 Days Return Support</p>
          </div>

          <div className="product-specs">
            <h3>Product Information</h3>

            <div>
              <span>Material</span>
              <strong>{product.material || "Premium Fabric"}</strong>
            </div>

            <div>
              <span>Fit</span>
              <strong>{product.fit || "Regular Fit"}</strong>
            </div>

            <div>
              <span>Made In</span>
              <strong>{product.madeIn || "Thailand / Korea"}</strong>
            </div>

            <div>
              <span>Delivery</span>
              <strong>{product.delivery || "2 - 3 Days"}</strong>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h2>You may also like</h2>

          <div className="related-grid">
            {relatedProducts.map((item) => {
              const relatedStock = Number(item.stock || 0);
              const relatedOutOfStock = relatedStock <= 0;
              const relatedLowStock = relatedStock > 0 && relatedStock <= 5;

              return (
                <div
                  key={item.id}
                  className="related-card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="product-image-wrap">
                    <span className="new-badge">NEW</span>

                    <button
                      type="button"
                      className="wishlist-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        alert("Wishlist feature coming soon ❤️");
                      }}
                      aria-label={`Add ${item.name} to wishlist`}
                    >
                      ❤️
                    </button>

                    <img src={item.image} alt={item.name} />
                  </div>

                  <p className="product-category">{item.category || "Fashion"}</p>
                  <h3>{item.name}</h3>

                  <div className="rating">
                    ⭐⭐⭐⭐⭐ <span>(4.9)</span>
                  </div>

                  <strong>{item.price} Baht</strong>

                  {relatedOutOfStock ? (
                    <p className="stock-badge out">Out of Stock</p>
                  ) : relatedLowStock ? (
                    <p className="stock-badge low">Only {relatedStock} left</p>
                  ) : (
                    <p className="stock-badge in">In Stock: {relatedStock}</p>
                  )}

                  <button
                    type="button"
                    disabled={relatedOutOfStock}
                    className={relatedOutOfStock ? "disabled-btn" : ""}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/product/${item.id}`);
                    }}
                  >
                    {relatedOutOfStock ? "Sold Out" : "View Details"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;