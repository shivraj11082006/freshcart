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
  getAvailableDeliveryPartners,
  assignDeliveryPartner,
} from "../api/api";

import "./shopkeeper.css";

function ShopkeeperOrders() {
  const navigate =
    useNavigate();

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    partners,
    setPartners,
  ] = useState([]);

  const [
    partnerSelections,
    setPartnerSelections,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  const [
    assigningId,
    setAssigningId,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState(
    "all"
  );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     LOAD
  ===================================================== */

  const loadOrders =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

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

          try {
            const partnerData =
              await getAvailableDeliveryPartners();

            setPartners(
              Array.isArray(
                partnerData?.partners
              )
                ? partnerData.partners
                : []
            );
          } catch (
            partnerError
          ) {
            console.error(
              "Unable to load delivery partners:",
              partnerError
            );

            setPartners([]);
          }
        } catch (
          error
        ) {
          setError(
            error.message ||
              "Unable to load shop orders."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    loadOrders();
  }, [
    loadOrders,
  ]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredOrders =
    useMemo(() => {
      if (
        filter ===
        "all"
      ) {
        return orders;
      }

      return orders.filter(
        (order) =>
          order.orderStatus ===
          filter
      );
    }, [
      orders,
      filter,
    ]);

  /* =====================================================
     HELPERS
  ===================================================== */

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
      switch (
        status
      ) {
        case "confirmed":
          return (
            <FaCheck />
          );

        case "preparing":
          return (
            <FaBox />
          );

        case "out_for_delivery":
          return (
            <FaTruck />
          );

        case "delivered":
          return (
            <FaCheck />
          );

        case "cancelled":
          return (
            <FaTimes />
          );

        default:
          return (
            <FaClock />
          );
      }
    };

  /* =====================================================
     ORDER STATUS
  ===================================================== */

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
      } catch (
        error
      ) {
        setError(
          error.message ||
            "Unable to update order."
        );
      } finally {
        setUpdatingId("");
      }
    };

  /* =====================================================
     ASSIGN PARTNER
  ===================================================== */

  const handleAssignPartner =
    async (
      orderId
    ) => {
      const partnerId =
        partnerSelections[
          orderId
        ];

      if (!partnerId) {
        setError(
          "Select a delivery partner first."
        );

        return;
      }

      try {
        setAssigningId(
          orderId
        );

        setError("");
        setMessage("");

        const data =
          await assignDeliveryPartner(
            orderId,
            partnerId
          );

        setOrders(
          (current) =>
            current.map(
              (order) =>
                order._id ===
                orderId
                  ? data?.order ||
                    order
                  : order
            )
        );

        setMessage(
          "Delivery partner assigned successfully."
        );
      } catch (
        error
      ) {
        setError(
          error.message ||
            "Unable to assign delivery partner."
        );
      } finally {
        setAssigningId(
          ""
        );
      }
    };

  /* =====================================================
     AVAILABLE ACTIONS
  ===================================================== */

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

        /*
          Once the delivery partner
          accepts the delivery, the
          partner completes delivery.
        */

        case "out_for_delivery":
          return [];

        default:
          return [];
      }
    };

  /* =====================================================
     LOADING
  ===================================================== */

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

      {/* TOP BAR */}

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

      {/* HEADER */}

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
          onClick={
            loadOrders
          }
        >
          Refresh
        </button>

      </div>

      {/* MESSAGE */}

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

      {/* FILTERS */}

      <div className="shopkeeper-order-filters">

        {[
          [
            "all",
            "All",
          ],

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
              key={
                value
              }
              className={
                filter ===
                value
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

      {/* EMPTY */}

      {!filteredOrders.length ? (
        <div className="shopkeeper-empty-orders">

          <FaBox
            size={42}
          />

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
            (
              order
            ) => {

              const actions =
                availableActions(
                  order
                );

              const canAssign =
                [
                  "confirmed",
                  "preparing",
                ].includes(
                  order.orderStatus
                ) &&
                order.deliveryAssignmentStatus !==
                  "accepted";

              return (
                <article
                  key={
                    order._id
                  }
                  className="shopkeeper-order-card"
                >

                  {/* HEADER */}

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

                      {String(
                        order.orderStatus
                      ).replaceAll(
                        "_",
                        " "
                      )}

                    </div>

                  </div>

                  {/* SHOP */}

                  <div className="shopkeeper-order-shop">

                    <FaStore />

                    <strong>
                      {order.shop
                        ?.shopName ||
                        "Your Shop"}
                    </strong>

                  </div>

                  {/* CUSTOMER */}

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

                  {/* ITEMS */}

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

                  {/* ADDRESS */}

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

                  {/* PAYMENT */}

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

                  {/* DELIVERY PARTNER ASSIGNMENT */}

                  {canAssign && (
                    <div
                      style={{
                        marginTop:
                          "16px",

                        padding:
                          "14px",

                        borderRadius:
                          "12px",

                        background:
                          "#f8fafc",

                        border:
                          "1px solid #e2e8f0",
                      }}
                    >

                      <strong
                        style={{
                          display:
                            "block",

                          marginBottom:
                            "8px",
                        }}
                      >
                        Delivery Partner
                      </strong>

                      {order.deliveryAssignmentStatus ===
                      "pending" ? (
                        <p
                          style={{
                            margin:
                              0,

                            color:
                              "#64748b",
                          }}
                        >
                          Waiting for the assigned
                          delivery partner to accept
                          this delivery.
                        </p>
                      ) : (

                        <div
                          style={{
                            display:
                              "flex",

                            gap:
                              "8px",

                            flexWrap:
                              "wrap",
                          }}
                        >

                          <select
                            value={
                              partnerSelections[
                                order._id
                              ] ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              setPartnerSelections(
                                (
                                  current
                                ) => ({
                                  ...current,

                                  [order._id]:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            style={{
                              flex:
                                "1 1 240px",

                              padding:
                                "10px",

                              borderRadius:
                                "8px",

                              border:
                                "1px solid #cbd5e1",
                            }}
                          >

                            <option value="">
                              Select available partner
                            </option>

                            {partners.map(
                              (
                                partner
                              ) => (
                                <option
                                  key={
                                    partner._id
                                  }
                                  value={
                                    partner._id
                                  }
                                >
                                  {partner.name}
                                  {" · "}
                                  {partner.phone}
                                </option>
                              )
                            )}

                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleAssignPartner(
                                order._id
                              )
                            }
                            disabled={
                              assigningId ===
                                order._id ||
                              !partners.length
                            }
                            style={{
                              border:
                                0,

                              borderRadius:
                                "8px",

                              padding:
                                "10px 14px",

                              background:
                                "#166534",

                              color:
                                "white",

                              fontWeight:
                                700,
                            }}
                          >

                            {assigningId ===
                            order._id ? (
                              <FaSpinner className="fa-spin" />
                            ) : (
                              "Assign"
                            )}

                          </button>

                        </div>

                      )}

                    </div>
                  )}

                  {/* ACCEPTED PARTNER */}

                  {order.deliveryAssignmentStatus ===
                    "accepted" &&
                    order.deliveryPartner && (
                      <div
                        style={{
                          marginTop:
                            "16px",

                          padding:
                            "14px",

                          borderRadius:
                            "12px",

                          background:
                            "#f0fdf4",

                          border:
                            "1px solid #bbf7d0",
                        }}
                      >

                        <strong>
                          Delivery Partner Accepted
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",
                          }}
                        >
                          {
                            order.deliveryPartner
                              .name
                          }

                          {" · "}

                          {order
                            .deliveryPartner
                            .phone ||
                            "N/A"}
                        </p>

                        <p
                          style={{
                            margin:
                              "6px 0 0",

                            color:
                              "#166534",

                            fontWeight:
                              700,
                          }}
                        >
                          Earning: ₹
                          {Number(
                            order.deliveryPartnerEarning ||
                              0
                          ).toFixed(
                            2
                          )}
                        </p>

                      </div>
                    )}

                  {/* ACTIONS */}

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