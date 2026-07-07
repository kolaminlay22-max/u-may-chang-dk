import { Link } from "react-router-dom";
function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>🛍️ U-May Chang Admin Dashboard</h1>

      <div className="admin-cards">
        <div className="card">
          <h2>📦 Products</h2>
          <p>Manage Products</p>
        </div>

       <Link to="/admin/orders" className="card">
  <h2>🧾 Orders</h2>
  <p>Manage Customer Orders</p>
</Link>

        <div className="card">
          <h2>👥 Customers</h2>
          <p>Customer List</p>
        </div>

        <div className="card">
          <h2>📊 Statistics</h2>
          <p>Sales Report</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;