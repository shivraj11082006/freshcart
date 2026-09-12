import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaSpinner,
  FaStore,
  FaTimesCircle,
  FaTruck,
  FaEye,
  FaArrowLeft,
} from "react-icons/fa";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMyOrders,
} from "../api/api";

import "../App.css";

function Orders() {
  const navigate =
    useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadOrders =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getMyOrders();

          const list =
            Array.isArray(
              data?.orders
            )
              ? data.orders
              : [];

          setOrders(list);
        } catch (error) {
          setError(
            error.message ||
              "Unable to load orders."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatDate =
    (date) =>
      date
        ? new Date(
            date
          ).toLocaleString(
            "en-IN",
            {
              dateStyle:
                "medium",
              timeStyle:
                "short",
            }
          )
        : "N/A";

  const statusIcon =
    (status) => {
      switch (status) {
        case "confirmed":
        case "delivered":
          return (
            <FaCheckCircle />
          );

        case "preparing":
          return (
            <FaBoxOpen />
          );

        case "out_for_delivery":
          return (
            <FaTruck />
          );

        case "cancelled":
          return (
            <FaTimesCircle />
          );

        default:
          return (
            <FaClock />
          );
      }
    };

  const statusLabel =
    (status) => {
      const map = {
        pending:
          "Pending",
        confirmed:
          "Confirmed",
        preparing:
          "Preparing",
        out_for_delivery:
          "Out for Delivery",
        delivered:
          "Delivered",
        cancelled:
          "Cancelled",
      };

      return (
        map[status] ||
        status ||
        "Pending"
      );
    };

  const statusClass =
    (status) =>
      `order-status ${
        status || "pending"
      }`;

  if (loading) {
    return (
      <div className="page-loader">
        <FaSpinner className="fa-spin" />
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="professional-orders-page">
        <div className="orders-page-top-nav">
          <button
            type="button"
            className="back-btn orders-back-btn"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft />
            Back to Home
          </button>
        </div>

        <div className="professional-empty-orders">
          <h2>
            Unable to load orders
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="professional-primary-btn"
            onClick={
              loadOrders
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="professional-orders-page">
        <div className="orders-page-top-nav">
          <button
            type="button"
            className="back-btn orders-back-btn"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft />
            Back to Home
          </button>
        </div>

        <div className="professional-empty-orders">
          <FaBoxOpen
            size={50}
          />

          <h2>
            No orders yet
          </h2>

          <p>
            Your orders from
            different FreshCart
            shops will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="professional-orders-page">
      <div className="orders-page-top-nav">
        <button
          type="button"
          className="back-btn orders-back-btn"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft />
          Back to Home
        </button>
      </div>

      <div className="orders-page-header">
        <div>
          <span className="orders-eyebrow">
            FRESHCART
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            Your orders from all
            shops in one place.
          </p>
        </div>

        <button
          type="button"
          className="professional-secondary-btn"
          onClick={
            loadOrders
          }
        >
          Refresh
        </button>
      </div>

      <div className="customer-orders-list">
        {orders.map(
          (order) => (
            <article
              key={
                order._id
              }
              className="customer-order-card"
            >
              <div className="customer-order-top">
                <div>
                  <span className="customer-order-label">
                    ORDER ID
                  </span>

                  <h2>
                    #
                    {String(
                      order._id
                    ).slice(-8)}
                  </h2>

                  <p>
                    {formatDate(
                      order.createdAt
                    )}
                  </p>
                </div>

                <div
                  className={statusClass(
                    order.orderStatus
                  )}
                >
                  {statusIcon(
                    order.orderStatus
                  )}

                  <span>
                    {statusLabel(
                      order.orderStatus
                    )}
                  </span>
                </div>
              </div>

              <div className="customer-order-shop">
                <FaStore />

                <div>
                  <span>
                    SHOP
                  </span>

                  <strong>
                    {order
                      .shop
                      ?.shopName ||
                      "FreshCart Shop"}
                  </strong>
                </div>
              </div>

              <div className="customer-order-items">
                {(
                  order.items ||
                  []
                ).map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      className="customer-order-item"
                      key={
                        item.product ||
                        index
                      }
                    >
                      <div className="customer-order-item-image">
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                          />
                        ) : (
                          <span>
                            🥬
                          </span>
                        )}
                      </div>

                      <div className="customer-order-item-info">
                        <strong>
                          {
                            item.name
                          }
                        </strong>

                        <span>
                          ₹
                          {Number(
                            item.price ||
                              0
                          ).toFixed(
                            2
                          )}{" "}
                          ×{" "}
                          {
                            item.quantity
                          }
                        </span>
                      </div>

                      <strong>
                        ₹
                        {Number(
                          item.subtotal ||
                            0
                        ).toFixed(
                          2
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div className="customer-order-details">
                <div>
                  <FaMapMarkerAlt />

                  <span>
                    {order.deliveryAddress ||
                      "Delivery address unavailable"}
                  </span>
                </div>

                <div>
                  <span>
                    Payment
                  </span>

                  <strong>
                    {order.paymentMethod ===
                    "online"
                      ? "Online"
                      : "Cash on Delivery"}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Status
                  </span>

                  <strong>
                    {order.paymentStatus ||
                      "pending"}
                  </strong>
                </div>
              </div>

              <div className="customer-order-total">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.subtotal ||
                        0
                    ).toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Delivery
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.deliveryCharge ||
                        0
                    ).toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div className="customer-order-grand-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.totalAmount ||
                        0
                    ).toFixed(
                      2
                    )}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="professional-secondary-btn"
                onClick={() =>
                  navigate(
                    `/order/${order._id}`
                  )
                }
              >
                <FaEye />

                View Order Details
              </button>
            </article>
          )
        )}
      </div>
    </div>
  );
}

export default Orders;