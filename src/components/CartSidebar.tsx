type CartSidebarProps = {
  cart: any[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onCheckout: () => void;
};

function CartSidebar({
  cart,
  onClose,
  onRemove,
  onIncrease,
  onDecrease,
  onCheckout,
}: CartSidebarProps) {
  const total = cart.reduce((sum, item) => {
    const price = Number(String(item.price).replace(/[^0-9]/g, ""));
    return sum + price * item.quantity;
  }, 0);

  return (
    <aside  className="cart-sidebar">
 <button className="cart-close" onClick={onClose}>
  ✕
</button>
      <h2>🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
        {cart.map((item, index) => (
  <div className="cart-item" key={index}>
    <div>
      <strong>{item.name}</strong>
      <br />
      <span>{item.price}</span>
    </div>
<br />
<span>Quantity: {item.quantity}</span>
<button onClick={() => onDecrease(item.id)}>
  -
</button>

<button onClick={() => onIncrease(item.id)}>
  +
</button>
    <button onClick={() => onRemove(index)}>
      🗑️
    </button>
  </div>
))}

          <hr />

          <h3>Total : {total}</h3>

         <button onClick={onCheckout}>
  Checkout
</button>
        </>
      )}
    </aside>
  );
}

export default CartSidebar;