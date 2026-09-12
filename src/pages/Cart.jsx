import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaHome,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";

import { useCart } from "../context/CartContext";
import "../App.css";

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    groupedCart,
    cartOriginalTotal,
    cartDiscountTotal,
    cartSubtotal,
    cartTotal,
    cartLoading,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [busy, setBusy] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

  const run = async (id, action) => {
    try {
      setBusy(id);
      setMessage("");

      await action();
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to update cart."
      );
    } finally {
      setBusy(null);
    }
  };

  const handleClearCart = async () => {
    if (cart.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);
      setMessage("");

      await clearCart();
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to clear cart."
      );
    } finally {
      setClearing(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="page-loader">
        <FaSpinner className="fa-spin" />
        Loading your cart...
      </div>
    );
  }

  const getProblem = (item) => {
    if (item.isActive === false) {
      return "Product unavailable";
    }

    if (Number(item.stock || 0) <= 0) {
      return "Out of stock";
    }

    if (
      Number(item.quantity || 0) >
      Number(item.stock || 0)
    ) {
      return `Only ${item.stock} available`;
    }

    if (
      Number(item.quantity || 0) <
      Number(item.minimumOrder || 1)
    ) {
      return `Minimum order: ${item.minimumOrder}`;
    }

    if (item.shop?.isOpen === false) {
      return `${item.shopName} is currently closed`;
    }

    return null;
  };

  const invalidItems = cart.filter(getProblem);

  const canCheckout =
    cart.length > 0 &&
    invalidItems.length === 0;

  const renderItem = (item) => {
    const problem = getProblem(item);

    const finalPrice =
      Number(item.finalPrice ?? item.price) || 0;

    const originalPrice =
      Number(
        item.originalPrice ?? item.price
      ) || 0;

    const quantity =
      Number(item.quantity || 0);

    const itemTotal =
      finalPrice * quantity;

    const itemDiscount =
      Math.max(
        0,
        originalPrice - finalPrice
      ) * quantity;

    return (
      <article
        className={`cart-item-card ${
          problem ? "has-problem" : ""
        }`}
        key={item.id}
      >
        <div className="cart-item-image">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
            />
          ) : (
            <span>🥬</span>
          )}
        </div>

        <div className="cart-item-info">
          <span className="product-category-tag">
            {item.category}
          </span>

          <h3>{item.name}</h3>

          <p>
            ₹{finalPrice.toFixed(2)}
            {item.unit
              ? ` / ${item.unit}`
              : ""}
          </p>

          {item.discountPercent > 0 && (
            <small>
              <s>
                ₹{originalPrice.toFixed(2)}
              </s>{" "}
              {item.discountPercent}% OFF
            </small>
          )}

          {itemDiscount > 0 && (
            <small>
              You save ₹
              {itemDiscount.toFixed(2)}
            </small>
          )}

          {problem && (
            <small className="cart-item-problem">
              ⚠️ {problem}
            </small>
          )}
        </div>

        <div className="cart-item-actions">
          <div className="quantity-control">
            <button
              type="button"
              aria-label={`Decrease ${item.name}`}
              disabled={
                busy === item.id ||
                clearing
              }
              onClick={() =>
                run(
                  item.id,
                  () =>
                    decreaseQuantity(item.id)
                )
              }
            >
              <FaMinus />
            </button>

            <strong>{item.quantity}</strong>

            <button
              type="button"
              aria-label={`Increase ${item.name}`}
              disabled={
                busy === item.id ||
                clearing ||
                Number(item.quantity || 0) >=
                  Number(item.stock || 0)
              }
              onClick={() =>
                run(
                  item.id,
                  () =>
                    increaseQuantity(item.id)
                )
              }
            >
              <FaPlus />
            </button>
          </div>

          <strong className="cart-item-total">
            ₹{itemTotal.toFixed(2)}
          </strong>

          <button
            type="button"
            className="cart-delete-btn"
            disabled={
              busy === item.id ||
              clearing
            }
            aria-label={`Remove ${item.name}`}
            onClick={() =>
              run(
                item.id,
                () =>
                  removeFromCart(item.id)
              )
            }
          >
            {busy === item.id ? (
              <FaSpinner className="spinner" />
            ) : (
              <FaTrash />
            )}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="cart-modern-page">
      <header className="market-topbar">
        <Link
          to="/"
          className="professional-logo"
        >
          🌿 Fresh
          <span>Cart</span>
        </Link>

        <div className="market-nav">
          <Link to="/">
            <FaHome />
            Home
          </Link>

          <Link to="/shop">
            <FaArrowLeft />
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="cart-page-container">
        <div className="cart-page-heading">
          <div>
            <h1>Your Cart 🛒</h1>

            <p>
              Your products are grouped by shop.
            </p>
          </div>

          <div>
            <Link
              className="professional-outline-btn"
              to="/shop"
            >
              ← Continue Shopping
            </Link>

            {cart.length > 0 && (
              <button
                type="button"
                className="professional-outline-btn"
                disabled={clearing}
                onClick={handleClearCart}
                style={{
                  marginLeft: "10px",
                }}
              >
                {clearing
                  ? "Clearing..."
                  : "Clear Cart"}
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="stock-warning-box">
            {message}
          </div>
        )}

        {invalidItems.length > 0 && (
          <div className="stock-warning-box">
            <strong>
              ⚠️ Some items need attention
            </strong>

            <ul>
              {invalidItems.map((item) => (
                <li key={item.id}>
                  {item.name}: {getProblem(item)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="empty-state">
            <FaShoppingCart size={42} />

            <h2>Your cart is empty</h2>

            <p>
              Add fresh products to get started.
            </p>

            <Link to="/shop">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              {groupedCart.map((group) => {
                const shopTotal =
                  group.items.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.finalPrice ??
                          item.price ??
                          0
                      ) *
                        Number(
                          item.quantity || 0
                        ),
                    0
                  );

                const shopDiscount =
                  group.items.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.discountPerUnit ||
                          0
                      ) *
                        Number(
                          item.quantity || 0
                        ),
                    0
                  );

                return (
                  <div
                    key={group.shopId}
                    className="shop-cart-group"
                  >
                    <div className="shop-cart-header">
                      <div>
                        <span>SHOP</span>

                        <h2>
                          🏪 {group.shopName}
                        </h2>

                        {group.shop?.city && (
                          <p>
                            📍 {group.shop.city}
                          </p>
                        )}

                        {group.shop && (
                          <small>
                            {group.shop.isOpen
                              ? "Open"
                              : "Closed"}

                            {group.shop.deliveryTime
                              ? ` • ${group.shop.deliveryTime}`
                              : ""}
                          </small>
                        )}
                      </div>

                      <div className="shop-cart-subtotal">
                        <span>
                          Shop Subtotal
                        </span>

                        <strong>
                          ₹{shopTotal.toFixed(2)}
                        </strong>

                        {shopDiscount > 0 && (
                          <small>
                            Save ₹
                            {shopDiscount.toFixed(
                              2
                            )}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="shop-cart-items">
                      {group.items.map(
                        (item) =>
                          renderItem(item)
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            <aside className="cart-summary-card">
              <div>
                <span>SUMMARY</span>

                <h2>Order Summary</h2>
              </div>

              <div className="cart-summary-row">
                <span>Items</span>

                <strong>
                  {cart.reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.quantity || 0
                      ),
                    0
                  )}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Shops</span>

                <strong>
                  {groupedCart.length}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Original price</span>

                <strong>
                  ₹{cartOriginalTotal.toFixed(2)}
                </strong>
              </div>

              {cartDiscountTotal > 0 && (
                <div className="cart-summary-row">
                  <span>Discount</span>

                  <strong>
                    -₹
                    {cartDiscountTotal.toFixed(2)}
                  </strong>
                </div>
              )}

              <div className="cart-summary-row">
                <span>Subtotal</span>

                <strong>
                  ₹{cartSubtotal.toFixed(2)}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>

                <strong>
                  Calculated at checkout
                </strong>
              </div>

              <div className="cart-summary-row cart-grand-total">
                <span>Total</span>

                <strong>
                  ₹{Number(cartTotal).toFixed(2)}
                </strong>
              </div>

              <button
                type="button"
                className="professional-primary-btn cart-checkout-btn"
                disabled={
                  !canCheckout || clearing
                }
                onClick={() =>
                  navigate("/checkout")
                }
              >
                Proceed to Checkout
              </button>

              {!canCheckout && (
                <p className="cart-checkout-help">
                  Fix the unavailable items above
                  before checkout.
                </p>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;