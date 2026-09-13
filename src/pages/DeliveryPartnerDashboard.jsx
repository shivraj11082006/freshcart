import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCheck,
  FaHistory,
  FaMapMarkerAlt,
  FaPhone,
  FaPowerOff,
  FaSpinner,
  FaTimes,
  FaTruck,
  FaUser,
  FaWallet,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  clearAuthData,
  decideDeliveryPartnerOrder,
  completeDeliveryPartnerOrder,
  getDeliveryPartnerDashboard,
  getDeliveryPartnerHistory,
  updateDeliveryPartnerAvailability,
  updateDeliveryPartnerProfile,
} from "../api/api";

import "../App.css";

/* =====================================================
   HELPERS
===================================================== */

function money(value) {
  return `₹${Number(
    value || 0
  ).toFixed(2)}`;
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      )
    : "N/A";
}

/* =====================================================
   COMPONENT
===================================================== */

function DeliveryPartnerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [tab, setTab] =
    useState("dashboard");

  const [loading, setLoading] =
    useState(true);

  const [workingId, setWorkingId] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [profile, setProfile] =
    useState({
      name: "",
      phone: "",
    });

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const loadDashboard =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const data =
            await getDeliveryPartnerDashboard();

          setDashboard(data);

          setProfile({
            name:
              data?.user?.name ||
              "",

            phone:
              data?.user?.phone ||
              "",
          });
        } catch (err) {
          setError(
            err.message ||
              "Unable to load delivery dashboard."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /* =====================================================
     LOAD HISTORY
  ===================================================== */

  const loadHistory =
    useCallback(
      async () => {
        try {
          const data =
            await getDeliveryPartnerHistory();

          setHistory(
            Array.isArray(
              data?.orders
            )
              ? data.orders
              : []
          );
        } catch (err) {
          setError(
            err.message ||
              "Unable to load delivery history."
          );
        }
      },
      []
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (
      tab === "history"
    ) {
      loadHistory();
    }
  }, [
    tab,
    loadHistory,
  ]);

  /* =====================================================
     DATA
  ===================================================== */

  const pending =
    Array.isArray(
      dashboard?.pending
    )
      ? dashboard.pending
      : [];

  const active =
    dashboard?.active ||
    null;

  const stats =
    dashboard?.stats || {};

  const greeting =
    useMemo(() => {
      const name =
        dashboard?.user?.name ||
        "Delivery Partner";

      return `Hello, ${name}`;
    }, [dashboard]);

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  const handleAvailability =
    async () => {
      const current =
        Boolean(
          dashboard?.user
            ?.deliveryPartnerAvailable
        );

      try {
        setWorkingId(
          "availability"
        );

        setError("");
        setMessage("");

        const data =
          await updateDeliveryPartnerAvailability(
            !current
          );

        setDashboard(
          (old) => ({
            ...(old || {}),

            user:
              data?.user ||
              old?.user,
          })
        );

        setMessage(
          data?.message ||
            "Availability updated."
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to update availability."
        );
      } finally {
        setWorkingId("");
      }
    };

  /* =====================================================
     ACCEPT / REJECT
  ===================================================== */

  const handleDecision =
    async (
      orderId,
      decision
    ) => {
      try {
        setWorkingId(
          orderId
        );

        setError("");
        setMessage("");

        const data =
          await decideDeliveryPartnerOrder(
            orderId,
            decision
          );

        setMessage(
          data?.message ||
            "Delivery request updated."
        );

        await loadDashboard();
      } catch (err) {
        setError(
          err.message ||
            "Unable to process delivery request."
        );
      } finally {
        setWorkingId("");
      }
    };

  /* =====================================================
     COMPLETE DELIVERY
  ===================================================== */

  const handleComplete =
    async (orderId) => {
      const confirmed =
        window.confirm(
          "Mark this order as delivered? This will add the delivery earning to your history."
        );

      if (!confirmed) {
        return;
      }

      try {
        setWorkingId(
          orderId
        );

        setError("");
        setMessage("");

        const data =
          await completeDeliveryPartnerOrder(
            orderId
          );

        setMessage(
          `${
            data?.message ||
            "Delivery completed."
          } Earned ${money(
            data?.earning
          )}.`
        );

        await loadDashboard();

        if (
          tab === "history"
        ) {
          await loadHistory();
        }
      } catch (err) {
        setError(
          err.message ||
            "Unable to complete delivery."
        );
      } finally {
        setWorkingId("");
      }
    };

  /* =====================================================
     PROFILE
  ===================================================== */

  const saveProfile =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);

        setError("");
        setMessage("");

        const data =
          await updateDeliveryPartnerProfile(
            {
              name:
                profile.name.trim(),
            }
          );

        setDashboard(
          (old) => ({
            ...(old || {}),

            user:
              data?.user ||
              old?.user,
          })
        );

        setMessage(
          "Profile updated successfully."
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to update profile."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    () => {
      clearAuthData();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading &&
    !dashboard
  ) {
    return (
      <div className="page-loader">
        <FaSpinner className="fa-spin" />

        Loading delivery dashboard...
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      style={{
        minHeight:
          "100vh",

        background:
          "#f8fafc",

        padding:
          "24px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1180px",

          margin:
            "0 auto",
        }}
      >

        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              "12px",

            flexWrap:
              "wrap",

            marginBottom:
              "20px",

            background:
              "#ffffff",

            padding:
              "14px 16px",

            borderRadius:
              "14px",

            border:
              "1px solid #e2e8f0",

            boxShadow:
              "0 4px 16px rgba(15, 23, 42, 0.05)",
          }}
        >

          <Link
            to="/"
            style={{
              display:
                "inline-flex",

              alignItems:
                "center",

              gap:
                "8px",

              textDecoration:
                "none",

              color:
                "#334155",

              fontWeight:
                700,
            }}
          >
            <FaArrowLeft />
            Back to Home
          </Link>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "10px",
            }}
          >

            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                color:
                  "#166534",

                fontWeight:
                  800,
              }}
            >
              🌿 FreshCart
            </div>

            <button
              type="button"
              onClick={
                handleLogout
              }
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                border:
                  "1px solid #fecaca",

                background:
                  "#fff1f2",

                color:
                  "#b91c1c",

                borderRadius:
                  "9px",

                padding:
                  "9px 13px",

                cursor:
                  "pointer",

                fontWeight:
                  700,
              }}
            >
              <FaSignOutAlt />
              Logout
            </button>

          </div>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            gap:
              "16px",

            alignItems:
              "center",

            flexWrap:
              "wrap",

            marginBottom:
              "22px",
          }}
        >

          <div>

            <div
              style={{
                color:
                  "#64748b",

                fontSize:
                  "13px",

                fontWeight:
                  700,
              }}
            >
              FRESHCART DELIVERY
            </div>

            <h1
              style={{
                margin:
                  "4px 0",
              }}
            >
              {greeting}
            </h1>

            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b",
              }}
            >
              Accept deliveries,
              track your active
              order and manage
              your earnings.
            </p>

          </div>

          <div
            style={{
              display:
                "flex",

              gap:
                "10px",

              flexWrap:
                "wrap",
            }}
          >

            <button
              type="button"
              onClick={
                handleAvailability
              }
              disabled={
                workingId ===
                "availability"
              }
              style={{
                display:
                  "inline-flex",

                alignItems:
                  "center",

                gap:
                  "8px",

                border:
                  "0",

                borderRadius:
                  "10px",

                padding:
                  "12px 16px",

                fontWeight:
                  700,

                cursor:
                  "pointer",

                background:
                  dashboard?.user
                    ?.deliveryPartnerAvailable
                    ? "#dcfce7"
                    : "#e2e8f0",

                color:
                  dashboard?.user
                    ?.deliveryPartnerAvailable
                    ? "#166534"
                    : "#475569",
              }}
            >
              {workingId ===
              "availability" ? (
                <FaSpinner className="fa-spin" />
              ) : (
                <FaPowerOff />
              )}

              {
                dashboard?.user
                  ?.deliveryPartnerAvailable
                  ? "Online"
                  : "Offline"
              }
            </button>

            <button
              type="button"
              onClick={
                () =>
                  loadDashboard()
              }
              style={{
                border:
                  "1px solid #cbd5e1",

                borderRadius:
                  "10px",

                padding:
                  "12px 16px",

                background:
                  "#ffffff",

                color:
                  "#334155",

                fontWeight:
                  700,

                cursor:
                  "pointer",
              }}
            >
              Refresh
            </button>

          </div>

        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {(message ||
          error) && (
          <div
            style={{
              marginBottom:
                "16px",

              padding:
                "14px",

              borderRadius:
                "12px",

              background:
                error
                  ? "#fee2e2"
                  : "#dcfce7",

              color:
                error
                  ? "#991b1b"
                  : "#166534",

              border:
                `1px solid ${
                  error
                    ? "#fecaca"
                    : "#bbf7d0"
                }`,
            }}
          >
            {
              error ||
              message
            }
          </div>
        )}

        {/* =================================================
            TABS
        ================================================= */}

        <div
          style={{
            display:
              "flex",

            gap:
              "8px",

            marginBottom:
              "20px",

            flexWrap:
              "wrap",
          }}
        >
          {[
            [
              "dashboard",
              "Dashboard",
            ],

            [
              "history",
              "History",
            ],

            [
              "profile",
              "Profile",
            ],
          ].map(
            ([
              value,
              label,
            ]) => (
              <button
                key={
                  value
                }
                type="button"
                onClick={() =>
                  setTab(
                    value
                  )
                }
                style={{
                  display:
                    "inline-flex",

                  alignItems:
                    "center",

                  gap:
                    "7px",

                  border:
                    "1px solid #e2e8f0",

                  borderRadius:
                    "10px",

                  padding:
                    "10px 14px",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",

                  background:
                    tab ===
                    value
                      ? "#166534"
                      : "#ffffff",

                  color:
                    tab ===
                    value
                      ? "#ffffff"
                      : "#334155",
                }}
              >

                {value ===
                "history" ? (
                  <FaHistory />
                ) : value ===
                  "profile" ? (
                  <FaUser />
                ) : (
                  <FaTruck />
                )}

                {label}

              </button>
            )
          )}
        </div>

        {/* =================================================
            DASHBOARD TAB
        ================================================= */}

        {tab ===
          "dashboard" && (
          <>

            {/* STATS */}

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",

                gap:
                  "14px",

                marginBottom:
                  "20px",
              }}
            >
              {[
                [
                  "Pending Requests",
                  pending.length,
                ],

                [
                  "Total Deliveries",
                  stats.totalDeliveries ||
                    0,
                ],

                [
                  "Today's Earnings",
                  money(
                    stats.todaysEarnings
                  ),
                ],

                [
                  "Total Earnings",
                  money(
                    stats.totalEarnings
                  ),
                ],
              ].map(
                ([
                  label,
                  value,
                ]) => (
                  <div
                    key={
                      label
                    }
                    style={{
                      background:
                        "#ffffff",

                      borderRadius:
                        "16px",

                      padding:
                        "18px",

                      border:
                        "1px solid #e2e8f0",
                    }}
                  >

                    <div
                      style={{
                        color:
                          "#64748b",

                        fontSize:
                          "13px",
                      }}
                    >
                      {label}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "26px",

                        fontWeight:
                          800,

                        marginTop:
                          "6px",
                      }}
                    >
                      {value}
                    </div>

                  </div>
                )
              )}
            </div>

            {/* DELIVERY REQUESTS */}

            <section
              style={{
                background:
                  "#ffffff",

                borderRadius:
                  "16px",

                padding:
                  "18px",

                border:
                  "1px solid #e2e8f0",

                marginBottom:
                  "18px",
              }}
            >

              <h2
                style={{
                  marginTop:
                    0,
                }}
              >
                Delivery Requests
              </h2>

              {!pending.length ? (
                <div
                  style={{
                    padding:
                      "25px",

                    textAlign:
                      "center",

                    color:
                      "#64748b",
                  }}
                >
                  <FaTruck
                    size={32}
                  />

                  <p>
                    No pending
                    delivery requests
                    right now.
                  </p>
                </div>
              ) : (
                pending.map(
                  (
                    order
                  ) => (
                    <article
                      key={
                        order._id
                      }
                      style={{
                        borderTop:
                          "1px solid #e2e8f0",

                        padding:
                          "16px 0",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "space-between",

                          gap:
                            "12px",

                          flexWrap:
                            "wrap",
                        }}
                      >

                        <div>

                          <strong>
                            Order #
                            {String(
                              order._id
                            ).slice(
                              -8
                            )}
                          </strong>

                          <div
                            style={{
                              color:
                                "#64748b",

                              marginTop:
                                "6px",
                            }}
                          >
                            {
                              order.shop
                                ?.shopName ||
                              "Shop"
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                "6px",
                            }}
                          >
                            <FaUser />

                            {" "}

                            {
                              order.customer
                                ?.name ||
                              "Customer"
                            }

                            {" · "}

                            {
                              order.customerPhone ||
                              order.customer
                                ?.phone ||
                              "N/A"
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                "6px",
                            }}
                          >
                            <FaMapMarkerAlt />

                            {" "}

                            {
                              order.deliveryAddress
                            }
                          </div>

                        </div>

                        <div>

                          <div
                            style={{
                              fontWeight:
                                800,

                              fontSize:
                                "18px",
                            }}
                          >
                            {money(
                              order.deliveryPartnerEarning
                            )}
                          </div>

                          <div
                            style={{
                              color:
                                "#64748b",

                              fontSize:
                                "12px",
                            }}
                          >
                            delivery earning
                          </div>

                        </div>

                      </div>

                      <div
                        style={{
                          display:
                            "flex",

                          gap:
                            "8px",

                          marginTop:
                            "12px",
                        }}
                      >

                        <button
                          type="button"
                          onClick={() =>
                            handleDecision(
                              order._id,
                              "accept"
                            )
                          }
                          disabled={
                            workingId ===
                            order._id
                          }
                          style={{
                            background:
                              "#166534",

                            color:
                              "#ffffff",

                            border:
                              0,

                            borderRadius:
                              "9px",

                            padding:
                              "10px 14px",

                            fontWeight:
                              700,

                            cursor:
                              "pointer",
                          }}
                        >

                          {workingId ===
                          order._id ? (
                            <FaSpinner className="fa-spin" />
                          ) : (
                            <FaCheck />
                          )}

                          {" "}
                          Accept

                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDecision(
                              order._id,
                              "reject"
                            )
                          }
                          disabled={
                            workingId ===
                            order._id
                          }
                          style={{
                            background:
                              "#fee2e2",

                            color:
                              "#991b1b",

                            border:
                              0,

                            borderRadius:
                              "9px",

                            padding:
                              "10px 14px",

                            fontWeight:
                              700,

                            cursor:
                              "pointer",
                          }}
                        >

                          <FaTimes />

                          {" "}
                          Reject

                        </button>

                      </div>

                    </article>
                  )
                )
              )}

            </section>

            {/* ACTIVE DELIVERY */}

            <section
              style={{
                background:
                  "#ffffff",

                borderRadius:
                  "16px",

                padding:
                  "18px",

                border:
                  "1px solid #e2e8f0",
              }}
            >

              <h2
                style={{
                  marginTop:
                    0,
                }}
              >
                Active Delivery
              </h2>

              {!active ? (
                <div
                  style={{
                    color:
                      "#64748b",
                  }}
                >
                  You have no active
                  delivery.
                </div>
              ) : (
                <div>

                  <strong>
                    Order #
                    {String(
                      active._id
                    ).slice(
                      -8
                    )}
                  </strong>

                  <p>
                    <FaUser />

                    {" "}

                    {
                      active.customer
                        ?.name ||
                      "Customer"
                    }

                    {" · "}

                    {
                      active.customerPhone ||
                      active.customer
                        ?.phone ||
                      "N/A"
                    }
                  </p>

                  <p>
                    <FaPhone />

                    {" "}

                    {
                      active.shop
                        ?.phone ||
                      "Shop phone unavailable"
                    }
                  </p>

                  <p>
                    <FaMapMarkerAlt />

                    {" "}

                    {
                      active.deliveryAddress
                    }
                  </p>

                  <p>
                    <strong>
                      Payment:
                    </strong>{" "}

                    {active.paymentMethod ===
                    "online"
                      ? "Online"
                      : "Cash on Delivery"}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleComplete(
                        active._id
                      )
                    }
                    disabled={
                      workingId ===
                      active._id
                    }
                    style={{
                      display:
                        "inline-flex",

                      alignItems:
                        "center",

                      gap:
                        "8px",

                      background:
                        "#166534",

                      color:
                        "#ffffff",

                      border:
                        0,

                      borderRadius:
                        "10px",

                      padding:
                        "11px 16px",

                      fontWeight:
                        700,

                      cursor:
                        "pointer",
                    }}
                  >

                    {workingId ===
                    active._id ? (
                      <FaSpinner className="fa-spin" />
                    ) : (
                      <FaCheck />
                    )}

                    Mark Delivered

                  </button>

                </div>
              )}

            </section>

          </>
        )}

        {/* =================================================
            HISTORY TAB
        ================================================= */}

        {tab ===
          "history" && (
          <section
            style={{
              background:
                "#ffffff",

              borderRadius:
                "16px",

              padding:
                "18px",

              border:
                "1px solid #e2e8f0",
            }}
          >

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                gap:
                  "12px",

                marginBottom:
                  "10px",
              }}
            >

              <h2
                style={{
                  marginTop:
                    0,
                }}
              >
                Delivery History
              </h2>

              <FaHistory />

            </div>

            {!history.length ? (
              <p
                style={{
                  color:
                    "#64748b",
                }}
              >
                No completed
                deliveries yet.
              </p>
            ) : (
              history.map(
                (
                  order
                ) => (
                  <article
                    key={
                      order._id
                    }
                    style={{
                      borderTop:
                        "1px solid #e2e8f0",

                      padding:
                        "14px 0",

                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      gap:
                        "15px",

                      flexWrap:
                        "wrap",
                    }}
                  >

                    <div>

                      <strong>
                        Order #
                        {String(
                          order._id
                        ).slice(
                          -8
                        )}
                      </strong>

                      <div>
                        {
                          order.customer
                            ?.name ||
                          "Customer"
                        }
                      </div>

                      <div
                        style={{
                          color:
                            "#64748b",
                        }}
                      >
                        {formatDate(
                          order.deliveredAt
                        )}
                      </div>

                    </div>

                    <div
                      style={{
                        fontWeight:
                          800,

                        color:
                          "#166534",

                        fontSize:
                          "18px",
                      }}
                    >
                      {money(
                        order.deliveryPartnerEarning
                      )}
                    </div>

                  </article>
                )
              )
            )}

          </section>
        )}

        {/* =================================================
            PROFILE TAB
        ================================================= */}

        {tab ===
          "profile" && (
          <section
            style={{
              background:
                "#ffffff",

              borderRadius:
                "16px",

              padding:
                "18px",

              border:
                "1px solid #e2e8f0",

              maxWidth:
                "650px",
            }}
          >

            <h2
              style={{
                marginTop:
                  0,
              }}
            >
              Delivery Partner Profile
            </h2>

            <form
              onSubmit={
                saveProfile
              }
            >

              <label
                style={{
                  display:
                    "block",

                  marginBottom:
                    "8px",

                  fontWeight:
                    700,
                }}
              >
                Name
              </label>

              <input
                value={
                  profile.name
                }
                onChange={(
                  event
                ) =>
                  setProfile(
                    (
                      old
                    ) => ({
                      ...old,

                      name:
                        event
                          .target
                          .value,
                    })
                  )
                }
                required
                style={{
                  width:
                    "100%",

                  padding:
                    "12px",

                  border:
                    "1px solid #cbd5e1",

                  borderRadius:
                    "9px",

                  marginBottom:
                    "16px",

                  boxSizing:
                    "border-box",
                }}
              />

              <label
                style={{
                  display:
                    "block",

                  marginBottom:
                    "8px",

                  fontWeight:
                    700,
                }}
              >
                Mobile
              </label>

              <input
                value={
                  profile.phone.replace(
                    "+91",
                    ""
                  )
                }
                disabled
                style={{
                  width:
                    "100%",

                  padding:
                    "12px",

                  border:
                    "1px solid #cbd5e1",

                  borderRadius:
                    "9px",

                  marginBottom:
                    "16px",

                  background:
                    "#f1f5f9",

                  boxSizing:
                    "border-box",
                }}
              />

              <button
                type="submit"
                disabled={
                  saving
                }
                style={{
                  display:
                    "inline-flex",

                  alignItems:
                    "center",

                  gap:
                    "8px",

                  background:
                    "#166534",

                  color:
                    "#ffffff",

                  border:
                    0,

                  borderRadius:
                    "9px",

                  padding:
                    "11px 16px",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",
                }}
              >

                {saving ? (
                  <FaSpinner className="fa-spin" />
                ) : (
                  <FaWallet />
                )}

                Save Profile

              </button>

            </form>

          </section>
        )}

      </div>
    </div>
  );
}

export default DeliveryPartnerDashboard;