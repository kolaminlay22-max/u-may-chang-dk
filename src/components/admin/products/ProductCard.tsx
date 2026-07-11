type ProductCardData = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  sizes: string[];
  description: string;
};

type ProductCardProps = {
  product: ProductCardData;
  onEdit: (product: ProductCardData) => void;
  onDelete: (product: ProductCardData) => void;
};

function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const getStockClass = (stock: number) => {
    if (stock === 0) return "out-of-stock";
    if (stock <= 5) return "low-stock";
    return "in-stock";
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 5) return `Low Stock: ${stock}`;
    return `In Stock: ${stock}`;
  };

  return (
    <article className="admin-product-card">
      <div className="admin-product-image-wrapper">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="admin-product-image"
          />
        ) : (
          <div className="admin-product-no-image">
            No Image
          </div>
        )}

        <span className="admin-product-category">
          {product.category}
        </span>

        <span
          className={`admin-product-stock ${getStockClass(
            product.stock
          )}`}
        >
          {getStockText(product.stock)}
        </span>
      </div>

      <div className="admin-product-content">
        <h3>{product.name}</h3>

        <p className="admin-product-price">
          ฿{product.price.toLocaleString()}
        </p>

        {product.description && (
          <p className="admin-product-description">
            {product.description}
          </p>
        )}

        <div className="admin-product-sizes">
          <span>Sizes:</span>

          {product.sizes.length > 0 ? (
            <div>
              {product.sizes.map((size) => (
                <small key={size}>{size}</small>
              ))}
            </div>
          ) : (
            <em>Not required</em>
          )}
        </div>

        <div className="admin-product-actions">
          <button
            type="button"
            className="edit-product-button"
            onClick={() => onEdit(product)}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-product-button"
            onClick={() => onDelete(product)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;