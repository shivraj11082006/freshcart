import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaShoppingCart,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

import { getProduct } from "../api/api";
import { useCart } from "../context/CartContext";

import "../App.css";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [adding, setAdding] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    const loadProduct =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getProduct(id);

          if (active) {
            setProduct(
              data?.product || data
            );
          }
        } catch (error) {
          if (active) {
            setError(
              error.message ||
                "Unable to load product."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const price =
    Number(product?.price) || 0;

  const discount =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          product?.discount || 0
        )
      )
    );

  const finalPrice =
    price -
    (price * discount) / 100;

  const stock =
    Number(product?.stock || 0);

  const canPurchase =
    Boolean(product) &&
    product.isActive !== false &&
    stock > 0;

  const handleAddToCart =
    async () => {
      if (
        !product ||
        !canPurchase ||
        adding
      ) {
        return;
      }

      try {
        setAdding(true);
        setMessage("");

        await addToCart(product);

        setMessage(
          "Product added to your cart!"
        );
      } catch (error) {
        setMessage(
          error.message ||
            "Unable to add product."
        );
      } finally {
        setAdding(false);
      }
    };

  if (loading) {
    return (
      <div className="page-loader">
        <FaSpinner className="fa-spin" />
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="empty-state">
        <h2>
          Product not found
        </h2>

        <p>{error}</p>

        <Link to="/shop">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <header className="market-topbar">
        <Link
          to="/"
          className="professional-logo"
        >
          🌿 Fresh<span>Cart</span>
        </Link>

        <Link
          to="/shop"
          className="back-btn"
        >
          <FaArrowLeft />
          Back to Shop
        </Link>
      </header>

      <main className="product-details-container">
        <div className="product-details-grid">
          <div className="product-details-image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <div className="product-details-no-image">
                🥬
              </div>
            )}
          </div>

          <div className="product-details-info">
            <span className="product-category-tag">
              {product.category}
            </span>

            <h1>
              {product.name}
            </h1>

            <div className="product-price-block">
              {discount > 0 && (
                <span className="old-price">
                  ₹{price.toFixed(2)}
                </span>
              )}

              <strong>
                ₹{finalPrice.toFixed(2)}
              </strong>

              {discount > 0 && (
                <span className="discount-badge">
                  {discount}% OFF
                </span>
              )}
            </div>

            <p className="product-details-description">
              {product.description ||
                "Fresh and carefully selected for your daily needs."}
            </p>

            <div className="product-info-list">
              <div>
                <span>Unit</span>
                <strong>
                  {product.unit ||
                    "unit"}
                </strong>
              </div>

              <div>
                <span>Available</span>
                <strong>
                  {stock > 0
                    ? `${stock} available`
                    : "Out of stock"}
                </strong>
              </div>

              <div>
                <span>Minimum Order</span>
                <strong>
                  {product.minimumOrder ||
                    1}
                </strong>
              </div>
            </div>

            {!canPurchase && (
              <div className="stock-warning-box">
                This product is currently unavailable.
              </div>
            )}

            {message && (
              <div className="account-success-message">
                <FaCheckCircle />
                {message}
              </div>
            )}

            <div className="product-details-actions">
              <button
                type="button"
                className="professional-primary-btn"
                disabled={
                  !canPurchase ||
                  adding
                }
                onClick={
                  handleAddToCart
                }
              >
                {adding ? (
                  <>
                    <FaSpinner className="spinner" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    Add to Cart
                  </>
                )}
              </button>

              {canPurchase && (
                <Link
                  to="/cart"
                  className="professional-outline-btn"
                >
                  View Cart
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;