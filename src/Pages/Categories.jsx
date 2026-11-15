import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faHeart,
  faCartShopping,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

// Men Images
import men1 from "../assets/p11.jpeg";
import timezoneP12 from "../assets/p12.jpeg";
import timezoneP2 from "../assets/p2.jpeg";
import timezoneP3 from "../assets/p3.jpeg";
import timezoneP4 from "../assets/p4.jpeg";
import timezoneP5 from "../assets/p5.jpeg";
import men2 from "../assets/ts.jpeg";
import men3 from "../assets/cs.jpeg";
import men4 from "../assets/fl.jpeg";

// Women Images
import women1 from "../assets/tl.jpeg";
import women2 from "../assets/csw.jpeg";

// Kids Images
import kids1 from "../assets/ccw.jpeg";

// Other Images
import sma from "../assets/fs.jpeg";
import luxury from "../assets/rw.jpeg";
import rolex from "../assets/rcw.jpeg";
import smart from "../assets/ksw.jpeg";
import digital from "../assets/kdw.jpeg";

function Categories() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Update search when URL query changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // Products are loaded from MongoDB through the backend API.
  const [products, setProducts] = useState([]);

  const categoryImages = {
    "p11.jpeg": men1,
    "p12.jpeg": timezoneP12,
    "p2.jpeg": timezoneP2,
    "p3.jpeg": timezoneP3,
    "p4.jpeg": timezoneP4,
    "p5.jpeg": timezoneP5,
    "ts.jpeg": men2,
    "cs.jpeg": men3,
    "fl.jpeg": men4,
    "tl.jpeg": women1,
    "csw.jpeg": women2,
    "ccw.jpeg": kids1,
    "fs.jpeg": sma,
    "rw.jpeg": luxury,
    "rcw.jpeg": rolex,
    "ksw.jpeg": smart,
    "kdw.jpeg": digital,
  };

  useEffect(() => {
    let active = true;

    fetch("http://localhost:5000/api/products")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load products");
        }
        const list = Array.isArray(data) ? data : data.products || [];
        if (active) {
          setProducts(
            list.map((product) => ({
              ...product,
              id: String(product._id || product.id),
              image: categoryImages[product.image] || product.image,
            })),
          );
        }
      })
      .catch((error) => {
        console.error("Load category products error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  // Search Products
  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    return (
      (product.name || "").toLowerCase().includes(searchText) ||
      (product.brand || "").toLowerCase().includes(searchText) ||
      (product.category || "").toLowerCase().includes(searchText) ||
      (product.type || "").toLowerCase().includes(searchText)
    );
  });

  // Check login
  const checkLogin = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const loggedInUser = JSON.parse(
      localStorage.getItem("loggedInUser") || "null",
    );

    if (!isLoggedIn || !loggedInUser || !loggedInUser._id) {
      alert("Please login first!");
      navigate("/login");
      return false;
    }

    return true;
  };

  // ADD TO CART
  const addToCart = (product) => {
    if (!checkLogin()) {
      return;
    }

    const oldCart = JSON.parse(localStorage.getItem("watchCart") || "[]");

    const productId = String(product.id);

    const existingProduct = oldCart.find(
      (item) => String(item.id || item._id) === productId,
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = oldCart.map((item) =>
        String(item.id || item._id) === productId
          ? {
              ...item,
              id: productId,
              quantity: (Number(item.quantity) || 1) + 1,
            }
          : item,
      );

      alert(`${product.name} quantity increased in cart!`);
    } else {
      updatedCart = [
        ...oldCart,
        {
          ...product,
          id: productId,
          quantity: 1,
        },
      ];

      alert(`${product.name} added to cart successfully!`);
    }

    localStorage.setItem("watchCart", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
  };

  // ADD TO WISHLIST
  const addToWishlist = (product) => {
    if (!checkLogin()) {
      return;
    }

    const oldWishlist = JSON.parse(
      localStorage.getItem("watchWishlist") || "[]",
    );

    const productId = String(product.id);

    const alreadyExists = oldWishlist.some(
      (item) => String(item.id || item._id) === productId,
    );

    if (alreadyExists) {
      alert("This product is already in your wishlist!");
      return;
    }

    const updatedWishlist = [
      ...oldWishlist,
      {
        ...product,
        id: productId,
      },
    ];

    localStorage.setItem("watchWishlist", JSON.stringify(updatedWishlist));

    window.dispatchEvent(new Event("wishlistUpdated"));

    alert(`${product.name} added to wishlist successfully!`);
  };

  // BUY NOW
  const buyNow = (product) => {
    if (!checkLogin()) {
      return;
    }

    const selectedProduct = {
      ...product,
      id: String(product.id),
      quantity: 1,
    };

    localStorage.setItem("buyNowProduct", JSON.stringify(selectedProduct));

    navigate("/buynow");
  };

  return (
    <div className="categories-page">
      <Container>
        {/* Heading */}
        <div className="categories-heading">
          <h1>Watch Categories</h1>

          <p>Search your favourite watch brand or type.</p>
        </div>

        {/* Search */}
        <div className="category-search">
          <Form.Control
            type="text"
            placeholder="Search Titan, Casio, Smart Watch..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {/* Products */}
        <Row>
          {filteredProducts.map((product) => (
            <Col xs={12} sm={6} lg={4} className="mb-4" key={product.id}>
              <Card className="category-card h-100">
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.name}
                  className="category-image"
                />

                <Card.Body className="d-flex flex-column">
                  <span className="category-badge">{product.brand}</span>

                  <Card.Title className="mt-2">{product.name}</Card.Title>

                  <Card.Text>{product.description}</Card.Text>

                  <p className="category-type">Type: {product.type}</p>

                  <p className="category-gender">
                    Category: {product.category}
                  </p>

                  <h5 className="category-price">
                    ₹{product.price.toLocaleString("en-IN")}
                  </h5>

                  <div className="category-buttons d-grid gap-2 mt-auto">
                    {/* Wishlist */}
                    <Button
                      variant="outline-danger"
                      onClick={() => addToWishlist(product)}
                    >
                      <FontAwesomeIcon icon={faHeart} /> Wishlist
                    </Button>

                    {/* Add to Cart */}
                    <Button variant="dark" onClick={() => addToCart(product)}>
                      <FontAwesomeIcon icon={faCartShopping} /> Add to Cart
                    </Button>

                    {/* Buy Now */}
                    <Button variant="warning" onClick={() => buyNow(product)}>
                      <FontAwesomeIcon icon={faBolt} /> Buy Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* No Products Found */}
        {filteredProducts.length === 0 && (
          <div className="no-category text-center py-5">
            <h4>No products found</h4>

            <p>Try searching Titan, Casio, Fossil, Rolex or Smart Watch.</p>
          </div>
        )}
      </Container>
    </div>
  );
}

export default Categories;
