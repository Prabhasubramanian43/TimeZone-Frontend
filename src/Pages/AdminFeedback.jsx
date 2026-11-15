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

const API = "https://timezone-backend-v4ra.onrender.com/api";
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

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const r = await fetch(`${API}/feedback`, { headers: authHeaders() });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Could not load feedback");
      setItems(d.feedback || []);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const remove = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      const r = await fetch(`${API}/feedback/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Delete failed");
      setItems((old) => old.filter((x) => x._id !== id));
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <AdminShell active="Feedback">
      <div className="admin-page-header">
        <div>
          <h1>Feedback Management</h1>
          <p>Read and manage customer feedback.</p>
        </div>
        <button className="admin-refresh-btn" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {!items.length && !error ? (
        <div className="admin-empty">No feedback received yet.</div>
      ) : (
        <div className="admin-feedback-list">
          {items.map((item) => (
            <article className="admin-content-card" key={item._id}>
              <div className="admin-page-header">
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.email} ·{" "}
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  className="admin-delete-btn"
                  onClick={() => remove(item._id)}
                >
                  Delete
                </button>
              </div>
              <p>{item.feedback}</p>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
