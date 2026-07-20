import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

function LiveProductList({
  onSelectProduct,
}: {
 onSelectProduct: (product: Product) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(data);
    };

    loadProducts();
  }, []);

  return (
    <section className="live-product-list">
      <h3>Products</h3>

      {products.map((product) => (
        <div
  key={product.id}
  onClick={() => onSelectProduct(product)}
  style={{ cursor: "pointer" }}
>
          <p>{product.name}</p>
          <p>฿{product.price}</p>
        </div>
      ))}
    </section>
  );
}

export default LiveProductList;