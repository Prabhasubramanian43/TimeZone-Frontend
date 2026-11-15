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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const empty = {
    name: "",
    brand: "",
    category: "Men",
    type: "Classic Watch",
    description: "",
    price: "",
    image: "",
  };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState("");
  const load = async () => {
    try {
      const r = await fetch(`${API}/products`, { headers: authHeaders() });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Could not load products");
      setProducts(d.products || []);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/products${editing ? `/${editing}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Save failed");
      setForm(empty);
      setEditing("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const edit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      type: p.type,
      description: p.description,
      price: String(p.price),
      image: p.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const r = await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Delete failed");
      setProducts((old) => old.filter((p) => p._id !== id));
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <AdminShell active="Products">
      <div className="admin-page-header">
        <div>
          <h1>Products Management</h1>
          <p>Add, edit and remove watches.</p>
        </div>
      </div>
      {error && <div className="admin-error">{error}</div>}
      <form className="admin-content-card admin-product-form" onSubmit={submit}>
        <h3>{editing ? "Edit Product" : "Add New Product"}</h3>
        <div className="admin-form-grid">
          {["name", "brand", "category", "type", "price", "image"].map((k) => (
            <label key={k}>
              {k[0].toUpperCase() + k.slice(1)}
              <input
                name={k}
                value={form[k]}
                onChange={change}
                required
                type={k === "price" ? "number" : "text"}
                min={k === "price" ? "0" : undefined}
                step={k === "price" ? "0.01" : undefined}
                placeholder={k === "image" ? "e.g. p11.jpeg" : ""}
              />
            </label>
          ))}
          <label className="admin-full-field">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              required
              rows="3"
            />
          </label>
        </div>
        <button className="admin-refresh-btn" disabled={busy}>
          {busy ? "Saving..." : editing ? "Update Product" : "Add Product"}
        </button>
        {editing && (
          <button
            type="button"
            className="admin-delete-btn"
            onClick={() => {
              setEditing("");
              setForm(empty);
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>
      <h2 className="mt-4">Product List ({products.length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.image}</td>
                <td>{p.name}</td>
                <td>{p.brand}</td>
                <td>{p.category}</td>
                <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
                <td>
                  <button className="admin-refresh-btn" onClick={() => edit(p)}>
                    Edit
                  </button>{" "}
                  <button
                    className="admin-delete-btn"
                    onClick={() => remove(p._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
