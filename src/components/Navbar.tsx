type NavbarProps = {
  user: any;
  search: string;
  cartCount: number;
  onSearchChange: (value: string) => void;
  onLogin: () => void;
  onLogout: () => void;

  isCartOpen: boolean;
onToggleCart: () => void;
};

function Navbar({
  user,
  search,
  cartCount,
  onSearchChange,
  onLogin,
  onLogout,
  onToggleCart,
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