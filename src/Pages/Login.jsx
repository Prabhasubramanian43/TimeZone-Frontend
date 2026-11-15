import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import watch1 from "../assets/bg.jpeg";

function Login() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const adminOnly = location.pathname === "/admin-login";

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const form = event.currentTarget;

    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const response = await fetch("https://timezone-backend-v4ra.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (!data.user || !data.user._id) {
        setError("User details are missing. Please check your backend.");
        return;
      }

      if (adminOnly && data.user.role !== "admin") {
        setError("This login is only for the TIMEZONE administrator.");
        return;
      }
      if (!data.token) {
        setError(
          "Login token was not returned by the server. Please contact the administrator.",
        );
        return;
      }
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));

      window.dispatchEvent(new Event("loginStatusChanged"));

      form.reset();

      alert("Login successful!");

      // Redirect according to user role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Unable to connect to server. Please check whether your backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${watch1})`,
      }}
    >
      <Container>
        <div className="login-box">
          <h1>TIMEZONE</h1>

          <p>{adminOnly ? "Administrator Login" : "Welcome back!"}</p>

          {message && <Alert variant="success">{message}</Alert>}

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>

              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>

              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </Form.Group>

            <Button
              variant="dark"
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form>

          {!adminOnly && (
            <p className="register-text">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          )}
          {adminOnly ? (
            <p className="register-text">
              <Link to="/login">Customer Login</Link>
            </p>
          ) : (
            <p className="register-text">
              <Link to="/admin-login">Admin Login</Link>
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}

export default Login;
