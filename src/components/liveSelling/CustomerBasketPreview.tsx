import "./CustomerBasketPreview.css";
import type { CustomerBasketItem } from "./customerSubmitTypes";

type CustomerBasketPreviewProps = {
  items: CustomerBasketItem[];
  onEdit: (itemId: string) => void;
  onRemove: (itemId: string) => void;
};

function CustomerBasketPreview({
  items,
  onEdit,
  onRemove,
}: CustomerBasketPreviewProps) {
  if (items.length === 0) {
    return (
      <section className="customer-basket-preview">
        <h2>Basket Preview</h2>
        <p>No products added yet.</p>
      </section>
    );
  }

  return (
    <section className="customer-basket-preview">
      <div className="customer-basket-preview__header">
        <h2>Basket Preview</h2>
        <span>
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="customer-basket-preview__list">
        {items.map((item, index) => (
          <article
            key={item.clientItemId}
            className="customer-basket-preview__item"
          >
            <div className="customer-basket-preview__image-wrapper">
              <img
                src={item.photoPreviewUrl}
                alt={`Selected product ${index + 1}`}
                className="customer-basket-preview__image"
              />
            </div>

            <div className="customer-basket-preview__details">
              <h3>Item {index + 1}</h3>

              <p>
                <strong>Size:</strong> {item.size || "Not selected"}
              </p>

              <p>
                <strong>Color:</strong> {item.color || "Not selected"}
              </p>

              <p>
                <strong>Quantity:</strong> {item.quantity}
              </p>

              {item.note.trim() && (
                <p>
                  <strong>Note:</strong> {item.note}
                </p>
              )}

              <div className="customer-basket-preview__actions">
                <button
                  type="button"
                  onClick={() => onEdit(item.clientItemId)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(item.clientItemId)}
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CustomerBasketPreview;