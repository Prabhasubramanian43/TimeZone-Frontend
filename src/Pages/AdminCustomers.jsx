import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaStar,
  FaSignOutAlt,
} from "react-icons/fa";

const API = "http://localhost:5000/api";
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
});

function AdminShell({ active, children }) {
  const navigate = useNavigate();
  const logout = () => {
    ["isLoggedIn", "loggedInUser", "authToken"].forEach((key) =>
      localStorage.removeItem(key),
    );
    window.dispatchEvent(new Event("loginStatusChanged"));
    navigate("/login", { replace: true });
  };
  const items = [
    ["Dashboard", "/admin/dashboard", <FaTachometerAlt />],
    ["Products", "/admin/products", <FaBox />],
    ["Orders", "/admin/orders", <FaShoppingBag />],
    ["Customers", "/admin/customers", <FaUsers />],
    ["Feedback", "/admin/feedback", <FaStar />],
  ];
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">TIMEZONE</h2>
        <nav className="admin-nav">
          {items.map(([name, path, icon]) => (
            <Link
              key={path}
              to={path}
              className={active === name ? "active" : ""}
            >
              {icon} {name}
            </Link>
          ))}
        </nav>
        <button className="admin-logout" onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/auth/customers`, {
          headers: authHeaders(),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || "Could not load customers");
        setCustomers(d.customers || []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);
  return (
    <AdminShell active="Customers">
      <div className="admin-page-header">
        <div>
          <h1>Customers Management</h1>
          <p>Registered TIMEZONE customers.</p>
        </div>
      </div>
      {error && <div className="admin-error">{error}</div>}
      <div className="orders-summary">
        <div>
          <h3>{customers.length}</h3>
          <p>Total Customers</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.mobile || "—"}</td>
                <td>{c.address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers.length && !error && (
          <p className="admin-empty">No customers registered yet.</p>
        )}
      </div>
    </AdminShell>
  );
}
