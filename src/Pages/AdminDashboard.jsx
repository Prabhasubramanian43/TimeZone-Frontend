import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaShoppingBag,
  FaBox,
  FaUsers,
  FaStar,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const [totalProducts, setTotalProducts] = useState("--");
  const [totalOrders, setTotalOrders] = useState("--");
  const [totalCustomers, setTotalCustomers] = useState("--");
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [productLoading, setProductLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(true);

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null",
  );

  // Fetch total products from MongoDB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://timezone-backend-v4ra.onrender.com/api/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to fetch products");
        }

        const data = await response.json();

        if (data.success) {
          setTotalProducts(data.count);
        }
      } catch (error) {
        console.error("Admin product count error:", error);
        setTotalProducts("--");
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch total orders and revenue from MongoDB
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("https://timezone-backend-v4ra.onrender.com/api/orders/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to fetch orders");
        }

        const data = await response.json();

        if (data.success) {
          setTotalOrders(data.totalOrders);
          setTotalRevenue(data.totalRevenue);
        }
      } catch (error) {
        console.error("Admin order statistics error:", error);
        setTotalOrders("--");
        setTotalRevenue(0);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch total customers from MongoDB
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("https://timezone-backend-v4ra.onrender.com/api/auth/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to fetch customers");
        }

        const data = await response.json();

        if (data.success) {
          setTotalCustomers(data.totalCustomers);
        }
      } catch (error) {
        console.error("Admin customer count error:", error);
        setTotalCustomers("--");
      } finally {
        setCustomerLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("authToken");

    window.dispatchEvent(new Event("loginStatusChanged"));

    navigate("/login", { replace: true });
  };

  // Sidebar menu
  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin/dashboard",
    },
    {
      name: "Products",
      icon: <FaBox />,
      path: "/admin/products",
    },
    {
      name: "Orders",
      icon: <FaShoppingBag />,
      path: "/admin/orders",
    },
    {
      name: "Customers",
      icon: <FaUsers />,
      path: "/admin/customers",
    },
    {
      name: "Feedback",
      icon: <FaStar />,
      path: "/admin/feedback",
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${menuOpen ? "show-sidebar" : ""}`}>
        <div className="admin-logo">
          <h2>TIMEZONE</h2>
          <span>ADMIN PANEL</span>
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">
            {loggedInUser?.name?.charAt(0).toUpperCase() || "A"}
          </div>

          <div>
            <h5>{loggedInUser?.name || "Admin"}</h5>
            <p>Administrator</p>
          </div>
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <Link
              to={item.path}
              key={item.name}
              className={`admin-menu-link ${
                item.name === "Dashboard" ? "active" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Dashboard */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <button
            className="admin-mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars />
          </button>

          <div>
            <h2>Dashboard Overview</h2>
            <p>Welcome back, {loggedInUser?.name || "Admin"}!</p>
          </div>

          <div className="admin-header-label">Admin Panel</div>
        </header>

        {/* Welcome Section */}
        <section className="admin-welcome">
          <div>
            <h2>Welcome to TIMEZONE Admin Dashboard</h2>
            <p>Manage your watch store from one place.</p>
          </div>

          <FaChartLine className="welcome-icon" />
        </section>

        {/* Statistics Cards */}
        <section className="admin-stats">
          {/* Total Orders */}
          <div className="stat-card">
            <div className="stat-icon orders-icon">
              <FaShoppingBag />
            </div>

            <div>
              <p>Total Orders</p>
              <h3>{orderLoading ? "Loading..." : totalOrders}</h3>
              <span>Order statistics</span>
            </div>
          </div>

          {/* Total Products */}
          <div className="stat-card">
            <div className="stat-icon products-icon">
              <FaBox />
            </div>

            <div>
              <p>Total Products</p>
              <h3>{productLoading ? "Loading..." : totalProducts}</h3>
              <span>Available watches</span>
            </div>
          </div>

          {/* Total Customers */}
          <div className="stat-card">
            <div className="stat-icon customers-icon">
              <FaUsers />
            </div>

            <div>
              <p>Total Customers</p>
              <h3>{customerLoading ? "Loading..." : totalCustomers}</h3>
              <span>Registered users</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="stat-card">
            <div className="stat-icon revenue-icon">
              <FaChartLine />
            </div>

            <div>
              <p>Total Revenue</p>
              <h3>
                {orderLoading
                  ? "Loading..."
                  : `₹ ${Number(totalRevenue).toLocaleString("en-IN")}`}
              </h3>
              <span>Sales overview</span>
            </div>
          </div>
        </section>

        {/* Quick Management */}
        <section className="admin-content-card">
          <h3>Quick Management</h3>

          <p>
            Select a section from the sidebar to manage your TIMEZONE store.
          </p>

          <div className="quick-actions">
            <div>
              <FaBox />
              <h5>Products</h5>
              <p>Manage your watch catalogue.</p>
            </div>

            <div>
              <FaShoppingBag />
              <h5>Orders</h5>
              <p>View and manage customer orders.</p>
            </div>

            <div>
              <FaUsers />
              <h5>Customers</h5>
              <p>View registered customers.</p>
            </div>

            <div>
              <FaStar />
              <h5>Feedback</h5>
              <p>Read customer feedback.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="admin-footer">
          © 2026 TIMEZONE Watches | Admin Dashboard
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
