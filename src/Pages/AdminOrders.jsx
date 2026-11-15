import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaStar,
  FaSignOutAlt,
  FaSync,
  FaTrash,
} from "react-icons/fa";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const API_URL = "http://localhost:5000/api/orders";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Unable to load orders. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await fetch(`${API_URL}/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
        body: JSON.stringify({ orderStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update failed");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: data.order.orderStatus }
            : order,
        ),
      );

      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Update order error:", err);
      alert(err.message || "Unable to update order status.");
    } finally {
      setUpdatingId("");
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?",
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      setOrders((previousOrders) =>
        previousOrders.filter((order) => order._id !== orderId),
      );

      alert("Order deleted successfully!");
    } catch (err) {
      console.error("Delete order error:", err);
      alert(err.message || "Unable to delete order.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("authToken");

    window.dispatchEvent(new Event("loginStatusChanged"));

    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "delivered";

      case "Shipped":
        return "shipped";

      case "Confirmed":
        return "confirmed";

      case "Cancelled":
        return "cancelled";

      default:
        return "pending";
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">TIMEZONE</h2>

        <nav className="admin-nav">
          <Link to="/admin/dashboard">
            <FaTachometerAlt /> Dashboard
          </Link>

          <Link to="/admin/products">
            <FaBox /> Products
          </Link>

          <Link to="/admin/orders" className="active">
            <FaShoppingBag /> Orders
          </Link>

          <Link to="/admin/customers">
            <FaUsers /> Customers
          </Link>

          <Link to="/admin/feedback">
            <FaStar /> Feedback
          </Link>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <h1>Orders Management</h1>
            <p>View and manage all customer orders.</p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={fetchOrders}
            disabled={loading}
          >
            <FaSync /> Refresh
          </button>
        </div>

        <div className="orders-summary">
          <div>
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>

          <div>
            <h3>
              {
                orders.filter((order) => order.orderStatus === "Delivered")
                  .length
              }
            </h3>
            <p>Delivered Orders</p>
          </div>

          <div>
            <h3>
              {
                orders.filter((order) => order.orderStatus === "Cancelled")
                  .length
              }
            </h3>
            <p>Cancelled Orders</p>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <FaShoppingBag />
            <h3>No Orders Found</h3>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <div className="admin-order-card" key={order._id}>
                <div className="admin-order-header">
                  <div>
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>

                  <span
                    className={`order-status ${getStatusClass(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus || "Order Placed"}
                  </span>
                </div>

                <div className="admin-customer-details">
                  <h4>Customer Details</h4>

                  <p>
                    <strong>Name:</strong> {order.customerName || "N/A"}
                  </p>

                  <p>
                    <strong>Email:</strong> {order.email || "N/A"}
                  </p>

                  <p>
                    <strong>Phone:</strong> {order.phone || "N/A"}
                  </p>

                  <p>
                    <strong>Address:</strong> {order.address || "N/A"}
                  </p>
                </div>

                <div className="admin-ordered-products">
                  <h4>Ordered Products</h4>

                  {order.products?.map((product, index) => (
                    <div
                      className="admin-product-item"
                      key={product._id || index}
                    >
                      {product.image && (
                        <img src={product.image} alt={product.name} />
                      )}

                      <div>
                        <strong>{product.name}</strong>
                        <p>
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                          {" × "}
                          {product.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-order-footer">
                  <div>
                    <p>
                      Payment: <strong>{order.paymentMethod || "N/A"}</strong>
                    </p>

                    <h3>
                      Total: ₹
                      {Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </h3>
                  </div>

                  <div className="admin-order-actions">
                    <select
                      value={order.orderStatus || "Order Placed"}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      disabled={updatingId === order._id}
                    >
                      <option value="Order Placed">Order Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      className="admin-delete-btn"
                      onClick={() => deleteOrder(order._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;
