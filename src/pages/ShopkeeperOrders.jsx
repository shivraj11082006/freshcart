import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaBox,
  FaCheck,
  FaClock,
  FaSpinner,
  FaStore,
  FaTimes,
  FaTruck,
} from "react-icons/fa";

import {
  getShopkeeperOrders,
  updateOrderStatus,
} from "../api/api";

import "./shopkeeper.css";

function ShopkeeperOrders() {
  const navigate =
    useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadOrders =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getShopkeeperOrders();

          setOrders(
            Array.isArray(
              data?.orders
            )
              ? data.orders
              : []
          );
        } catch (error) {
          setError(
            error.message ||
              "Unable to load shop orders."
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

  const filteredOrders =
    useMemo(() => {
      if (
        filter === "all"
      ) {
        return orders;
      }

      return orders.filter(
        (order) =>
          order.orderStatus ===
          filter
      );
    }, [orders, filter]);

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
          return <FaCheck />;

        case "preparing":
          return <FaBox />;

        case "out_for_delivery":
          return <FaTruck />;

        case "delivered":
          return (
            <FaCheck />
          );

        case "cancelled":
          return <FaTimes />;

        default:
          return (
            <FaClock />
          );
      }
    };

  const handleStatus =
    async (
      orderId,
      status
    ) => {
      try {
        setUpdatingId(
          orderId
        );

        setMessage("");
        setError("");

        const data =
          await updateOrderStatus(
            orderId,
            status
          );

        const updated =
          data?.order;

        setOrders(
          (current) =>
            current.map(
              (order) =>
                order._id ===
                orderId
                  ? updated ||
                    {
                      ...order,
                      orderStatus:
                        status,
                    }
                  : order
            )
        );

        setMessage(
          "Order status updated successfully."
        );
      } catch (error) {
        setError(
          error.message ||
            "Unable to update order."
        );
      } finally {
        setUpdatingId("");
      }
    };

  const availableActions =
    (order) => {
      switch (
        order.orderStatus
      ) {
        case "pending":
          return [
            {
              label:
                "Confirm",
              status:
                "confirmed",
              className:
                "shopkeeper-order-success",
            },
            {
              label:
                "Cancel",
              status:
                "cancelled",
              className:
                "shopkeeper-order-danger",
            },
          ];

        case "confirmed":
          return [
            {
              label:
                "Start Preparing",
              status:
                "preparing",
              className:
                "shopkeeper-order-primary",
            },
            {
              label:
                "Cancel",
              status:
                "cancelled",
              className:
                "shopkeeper-order-danger",
            },
          ];

        case "preparing":
          return [
            {
              label:
                "Out for Delivery",
              status:
                "out_for_delivery",
              className:
                "shopkeeper-order-primary",
            },
            {
              label:
                "Cancel",
              status:
                "cancelled",
              className:
                "shopkeeper-order-danger",
            },
          ];

        case "out_for_delivery":
          return [
            {
              label:
                "Mark Delivered",
              status:
                "delivered",
              className:
                "shopkeeper-order-success",
            },
          ];

        default:
          return [];
      }
    };

  if (loading) {
    return (
      <div className="shopkeeper-page-loader">
        <FaSpinner className="fa-spin" />
        Loading your shop
        orders...
      </div>
    );
  }

  return (
    <div className="shopkeeper-orders-page">
      <div className="shopkeeper-orders-topbar">
        <button
          type="button"
          className="shopkeeper-orders-back"
          onClick={() =>
            navigate(
              "/shopkeeper-dashboard"
            )
          }
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>
      </div>

      <div className="shopkeeper-orders-header">
        <div>
          <span>
            SHOPKEEPER
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            These orders belong only
            to your shop.
          </p>
        </div>

        <button
          type="button"
          className="shopkeeper-refresh-btn"
          onClick={loadOrders}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="shopkeeper-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="shopkeeper-error-message">
          {error}
        </div>
      )}

      <div className="shopkeeper-order-filters">
        {[
          ["all", "All"],
          [
            "pending",
            "Pending",
          ],
          [
            "confirmed",
            "Confirmed",
          ],
          [
            "preparing",
            "Preparing",
          ],
          [
            "out_for_delivery",
            "Out for Delivery",
          ],
          [
            "delivered",
            "Delivered",
          ],
          [
            "cancelled",
            "Cancelled",
          ],
        ].map(
          ([
            value,
            label,
          ]) => (
            <button
              type="button"
              key={value}
              className={
                filter === value
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(
                  value
                )
              }
            >
              {label}

              <strong>
                {
                  orders.filter(
                    (
                      order
                    ) =>
                      value ===
                        "all" ||
                      order.orderStatus ===
                        value
                  ).length
                }
              </strong>
            </button>
          )
        )}
      </div>

      {!filteredOrders.length ? (
        <div className="shopkeeper-empty-orders">
          <FaBox size={42} />

          <h2>
            No orders found
          </h2>

          <p>
            Orders matching this
            filter will appear here.
          </p>
        </div>
      ) : (
        <div className="shopkeeper-order-list">
          {filteredOrders.map(
            (order) => {
              const actions =
                availableActions(
                  order
                );

              return (
                <article
                  key={order._id}
                  className="shopkeeper-order-card"
                >
                  <div className="shopkeeper-order-card-top">
                    <div>
                      <span>
                        ORDER
                      </span>

                      <h2>
                        #
                        {String(
                          order._id
                        ).slice(
                          -8
                        )}
                      </h2>

                      <p>
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>

                    <div
                      className={`shopkeeper-status ${order.orderStatus}`}
                    >
                      {statusIcon(
                        order.orderStatus
                      )}

                      {order.orderStatus.replaceAll(
                        "_",
                        " "
                      )}
                    </div>
                  </div>

                  <div className="shopkeeper-order-shop">
                    <FaStore />

                    <strong>
                      {order.shop
                        ?.shopName ||
                        "Your Shop"}
                    </strong>
                  </div>

                  <div className="shopkeeper-customer">
                    <div>
                      <span>
                        CUSTOMER
                      </span>

                      <strong>
                        {order.customer
                          ?.name ||
                          "Customer"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        PHONE
                      </span>

                      <strong>
                        {order.customerPhone ||
                          order.customer
                            ?.phone ||
                          "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="shopkeeper-order-items">
                    {(
                      order.items ||
                      []
                    ).map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            item.product ||
                            index
                          }
                          className="shopkeeper-order-item"
                        >
                          <div>
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

                  <div className="shopkeeper-order-address">
                    <span>
                      DELIVERY ADDRESS
                    </span>

                    <p>
                      {
                        order.deliveryAddress
                      }
                    </p>
                  </div>

                  <div className="shopkeeper-order-payment">
                    <div>
                      <span>
                        PAYMENT
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
                        PAYMENT STATUS
                      </span>

                      <strong>
                        {
                          order.paymentStatus
                        }
                      </strong>
                    </div>

                    <div className="shopkeeper-order-total">
                      <span>
                        TOTAL
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

                  {actions.length >
                    0 && (
                    <div className="shopkeeper-order-actions">
                      {actions.map(
                        (
                          action
                        ) => (
                          <button
                            type="button"
                            key={
                              action.status
                            }
                            className={
                              action.className
                            }
                            disabled={
                              updatingId ===
                              order._id
                            }
                            onClick={() =>
                              handleStatus(
                                order._id,
                                action.status
                              )
                            }
                          >
                            {updatingId ===
                            order._id ? (
                              <FaSpinner className="fa-spin" />
                            ) : null}

                            {
                              action.label
                            }
                          </button>
                        )
                      )}
                    </div>
                  )}
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default ShopkeeperOrders;