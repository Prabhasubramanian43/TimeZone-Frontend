import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";

import Home from "./Pages/Home";
import Products from "./Pages/Products";
import Categories from "./Pages/Categories";
import Wishlist from "./Pages/Wishlist";
import Cart from "./Pages/Cart";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import BuyNow from "./Pages/BuyNow";

import AdminDashboard from "./Pages/AdminDashboard";
import AdminProducts from "./Pages/AdminProducts";
import AdminOrders from "./Pages/AdminOrders";
import AdminCustomers from "./Pages/AdminCustomers";
import AdminFeedback from "./Pages/AdminFeedback";

import "./App.css";

function AppContent() {
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true",
  );

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "null",
  );

  const isAdmin = loggedInUser?.role === "admin";

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("storage", checkLogin);
    window.addEventListener("loginStatusChanged", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("loginStatusChanged", checkLogin);
    };
  }, []);

  const isAdminPage = location.pathname.startsWith("/admin");

  const hideLayout =
    !isLoggedIn ||
    isAdminPage ||
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const homePath = isAdmin ? "/admin/dashboard" : "/home";

  const adminAccess = (page) =>
    isLoggedIn && isAdmin ? (
      page
    ) : (
      <Navigate to={isLoggedIn ? "/home" : "/login"} replace />
    );

  return (
    <>
      {!hideLayout && isLoggedIn && <Navbar />}

      <Routes>
        {/* Login and Register */}

        <Route
          path="/"
          element={isLoggedIn ? <Navigate to={homePath} replace /> : <Login />}
        />

        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to={homePath} replace /> : <Login />}
        />

        <Route path="/admin-login" element={<Login />} />

        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to={homePath} replace /> : <Register />
          }
        />

        {/* Admin Panel */}

        <Route
          path="/admin/dashboard"
          element={adminAccess(<AdminDashboard />)}
        />

        <Route
          path="/admin/products"
          element={adminAccess(<AdminProducts />)}
        />

        <Route path="/admin/orders" element={adminAccess(<AdminOrders />)} />

        <Route
          path="/admin/customers"
          element={adminAccess(<AdminCustomers />)}
        />

        <Route
          path="/admin/feedback"
          element={adminAccess(<AdminFeedback />)}
        />

        {/* Customer Pages */}

        <Route
          path="/home"
          element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/products"
          element={isLoggedIn ? <Products /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/categories"
          element={
            isLoggedIn ? <Categories /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/wishlist"
          element={isLoggedIn ? <Wishlist /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/cart"
          element={isLoggedIn ? <Cart /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/buynow"
          element={isLoggedIn ? <BuyNow /> : <Navigate to="/login" replace />}
        />

        {/* Other Routes */}

        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? homePath : "/login"} replace />}
        />
      </Routes>

      {!hideLayout && isLoggedIn && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
