type NavbarProps = {
  user: any;
  search: string;
  cartCount: number;
  wishlistCount?: number;
  onSearchChange: (value: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  isCartOpen: boolean;
  onToggleCart: () => void;
  onOpenWishlist?: () => void;
};

function Navbar({
  user,
  search,
  cartCount,
  wishlistCount = 0,
  onSearchChange,
  onLogin,
  onLogout,
  onToggleCart,
  onOpenWishlist,
}: NavbarProps) {
  return (
    <nav className="navbar">
      <h1 className="logo">U-May Chang</h1>

      <input
        className="nav-search"
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="nav-actions">
        <button className="wishlist-badge" onClick={onOpenWishlist}>
          💜 {wishlistCount}
        </button>

        <button className="cart-badge" onClick={onToggleCart}>
          🛒 {cartCount}
        </button>

        {user ? (
          <>
            <span className="user-name">{user.displayName}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button onClick={onLogin}>Sign in</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;