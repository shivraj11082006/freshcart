import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaSpinner,
  FaStore,
  FaTimesCircle,
  FaTruck,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  cancelMyOrder,
  getMyOrder,
} from "../api/api";

import "../App.css";

function OrderDetails() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const [order, setOrder] =
    useState(null);

  const [
    relatedOrders,
    setRelatedOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadOrder =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getMyOrder(id);

          setOrder(
            data?.order ||
              null
          );

          setRelatedOrders(
            Array.isArray(
              data?.relatedOrders
            )
              ? data.relatedOrders
              : []
          );
        } catch (error) {
          setError(
            error.message ||
              "Unable to load order."
          );
        } finally {
          setLoading(false);
        }
      },
      [id]
    );

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

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

        case "delivered":
          return (
            <FaCheckCircle />
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
      const labels = {
        pending: "Pending",
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
        labels[status] ||
        status ||
        "Pending"
      );
    };

  const canCancel =
    [
      "pending",
      "confirmed",
      "preparing",
    ].includes(
      order?.orderStatus
    );

  const handleCancel =
    async () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this order?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancelling(
          true
        );
        setError("");

        const data =
          await cancelMyOrder(
            order._id,
            "Cancelled by customer"
          );

        if (
          data?.order
        ) {
          setOrder(
            data.order
          );
        } else {
          await loadOrder();
        }
      } catch (error) {
        setError(
          error.message ||
            "Unable to cancel order."
        );
      } finally {
        setCancelling(
          false
        );
      }
    };

  if (loading) {
    return (
      <div className="page-loader">
        <FaSpinner className="fa-spin" />
        Loading order...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="professional-orders-page">
        <div className="professional-empty-orders">
          <h2>
            Unable to load order
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="professional-primary-btn"
            onClick={
              loadOrder
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="professional-orders-page">
        <div className="professional-empty-orders">
          <h2>
            Order not found
          </h2>

          <Link
            to="/orders"
            className="professional-primary-btn"
          >
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  const totalItems =
    (order.items || []).reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );

  return (
    <div className="professional-orders-page">
      <div className="orders-page-header">
        <div>
          <Link
            to="/orders"
            className="professional-secondary-btn"
          >
            <FaArrowLeft />

            Back to Orders
          </Link>

          <span
            className="orders-eyebrow"
            style={{
              display:
                "block",
              marginTop:
                "16px",
            }}
          >
            ORDER DETAILS
          </span>

          <h1>
            #
            {String(
              order._id
            ).slice(-8)}
          </h1>

          <p>
            Placed on{" "}
            {formatDate(
              order.createdAt
            )}
          </p>
        </div>
      </div>

      {error && (
        <div
          className="checkout-error"
          style={{
            marginBottom:
              "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* ==========================================
          STATUS
      ========================================== */}

      <section className="customer-order-card">
        <div className="customer-order-top">
          <div>
            <span className="customer-order-label">
              ORDER STATUS
            </span>

            <h2>
              {statusLabel(
                order.orderStatus
              )}
            </h2>
          </div>

          <div
            className={`order-status ${
              order.orderStatus ||
              "pending"
            }`}
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
      </section>

      {/* ==========================================
          SHOP
      ========================================== */}

      <section className="customer-order-card">
        <div className="customer-order-shop">
          <FaStore />

          <div>
            <span>
              SHOP
            </span>

            <strong>
              {order.shop
                ?.shopName ||
                "FreshCart Shop"}
            </strong>
          </div>
        </div>

        {order.shop?.city && (
          <p>
            📍 {order.shop.city}
          </p>
        )}
      </section>

      {/* ==========================================
          ITEMS
      ========================================== */}

      <section className="customer-order-card">
        <div className="customer-order-top">
          <div>
            <span className="customer-order-label">
              ITEMS
            </span>

            <h2>
              {totalItems}{" "}
              {totalItems ===
              1
                ? "Item"
                : "Items"}
            </h2>
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
                    {item.name}
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
      </section>

      {/* ==========================================
          DELIVERY
      ========================================== */}

      <section className="customer-order-card">
        <div className="customer-order-shop">
          <FaMapMarkerAlt />

          <div>
            <span>
              DELIVERY ADDRESS
            </span>

            <strong>
              {order.customer
                ?.name ||
                "Customer"}
            </strong>
          </div>
        </div>

        <p>
          {order.deliveryAddress}
        </p>

        <p>
          📞{" "}
          {
            order.customerPhone
          }
        </p>
      </section>

      {/* ==========================================
          PAYMENT
      ========================================== */}

      <section className="customer-order-card">
        <div className="customer-order-details">
          <div>
            <span>
              Payment Method
            </span>

            <strong>
              {order.paymentMethod ===
              "online"
                ? "Online Payment"
                : "Cash on Delivery"}
            </strong>
          </div>

          <div>
            <span>
              Payment Status
            </span>

            <strong>
              {
                order.paymentStatus
              }
            </strong>
          </div>

          {order.razorpayPaymentId && (
            <div>
              <span>
                Payment ID
              </span>

              <strong>
                {
                  order.razorpayPaymentId
                }
              </strong>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          TOTAL
      ========================================== */}

      <section className="customer-order-card">
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

        {canCancel && (
          <button
            type="button"
            disabled={
              cancelling
            }
            className="professional-secondary-btn"
            onClick={
              handleCancel
            }
          >
            {cancelling ? (
              <>
                <FaSpinner className="fa-spin" />

                Cancelling...
              </>
            ) : (
              <>
                <FaTimesCircle />

                Cancel Order
              </>
            )}
          </button>
        )}
      </section>

      {/* ==========================================
          SPLIT ORDERS
      ========================================== */}

      {relatedOrders.length >
        1 && (
        <section className="customer-order-card">
          <span className="customer-order-label">
            SAME CHECKOUT
          </span>

          <h2>
            {relatedOrders.length}{" "}
            Shop Orders
          </h2>

          {relatedOrders.map(
            (
              related
            ) => (
              <button
                type="button"
                key={
                  related._id
                }
                className="professional-secondary-btn"
                style={{
                  margin:
                    "6px",
                }}
                onClick={() =>
                  navigate(
                    `/order/${related._id}`
                  )
                }
              >
                <FaStore />

                {related.shop
                  ?.shopName ||
                  "Shop"}{" "}
                ·{" "}
                {
                  statusLabel(
                    related.orderStatus
                  )
                }
              </button>
            )
          )}
        </section>
      )}
    </div>
  );
}

export default OrderDetails;