import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaClock,
  FaShoppingBag,
  FaSpinner,
  FaTruck,
  FaTimesCircle,
  FaTrash,
  FaCreditCard,
} from "react-icons/fa";

import {
  useNavigate,
} from "react-router-dom";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  clearReadNotifications,
} from "../api/api";

import "../App.css";

function Notifications() {
  const navigate =
    useNavigate();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    updating,
    setUpdating,
  ] = useState("");

  /* ==========================================
     LOAD
  ========================================== */

  const loadNotifications =
    useCallback(
      async (
        silent = false
      ) => {
        try {
          if (silent) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const data =
            await getNotifications(
              100
            );

          const list =
            Array.isArray(
              data?.notifications
            )
              ? data.notifications
              : [];

          setNotifications(
            list
          );

          setUnreadCount(
            Number(
              data?.unreadCount ||
                0
            )
          );
        } catch (error) {
          console.error(
            "Load notifications error:",
            error
          );

          setError(
            error.message ||
              "Unable to load notifications."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadNotifications();

    const interval =
      setInterval(
        () =>
          loadNotifications(
            true
          ),
        30000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [loadNotifications]);

  /* ==========================================
     MARK ONE
  ========================================== */

  const markAsRead =
    async (id) => {
      if (!id) {
        return;
      }

      const target =
        notifications.find(
          (
            notification
          ) =>
            notification._id ===
            id
        );

      if (
        !target ||
        target.isRead
      ) {
        return;
      }

      try {
        setUpdating(id);

        const data =
          await markNotificationAsRead(
            id
          );

        setNotifications(
          (current) =>
            current.map(
              (
                notification
              ) =>
                notification._id ===
                id
                  ? {
                      ...notification,
                      isRead:
                        true,
                    }
                  : notification
            )
        );

        setUnreadCount(
          Number(
            data?.unreadCount ??
              Math.max(
                0,
                unreadCount - 1
              )
          )
        );
      } catch (error) {
        setError(
          error.message ||
            "Unable to update notification."
        );
      } finally {
        setUpdating("");
      }
    };

  /* ==========================================
     MARK ALL
  ========================================== */

  const markAllRead =
    async () => {
      if (
        unreadCount <= 0
      ) {
        return;
      }

      try {
        setUpdating(
          "all"
        );

        await markAllNotificationsAsRead();

        setNotifications(
          (current) =>
            current.map(
              (
                notification
              ) => ({
                ...notification,
                isRead: true,
              })
            )
        );

        setUnreadCount(0);
      } catch (error) {
        setError(
          error.message ||
            "Unable to mark all notifications as read."
        );
      } finally {
        setUpdating("");
      }
    };

  /* ==========================================
     DELETE ONE
  ========================================== */

  const deleteOne =
    async (
      id
    ) => {
      if (!id) {
        return;
      }

      try {
        setUpdating(
          `delete-${id}`
        );

        const notification =
          notifications.find(
            (
              item
            ) =>
              item._id ===
              id
          );

        const data =
          await deleteNotification(
            id
          );

        setNotifications(
          (current) =>
            current.filter(
              (
                item
              ) =>
                item._id !==
                id
            )
        );

        if (
          !notification
            ?.isRead
        ) {
          setUnreadCount(
            Number(
              data?.unreadCount ??
                Math.max(
                  0,
                  unreadCount - 1
                )
            )
          );
        }
      } catch (error) {
        setError(
          error.message ||
            "Unable to delete notification."
        );
      } finally {
        setUpdating("");
      }
    };

  /* ==========================================
     CLEAR READ
  ========================================== */

  const clearRead =
    async () => {
      const readCount =
        notifications.filter(
          (
            notification
          ) =>
            notification.isRead
        ).length;

      if (
        readCount === 0
      ) {
        return;
      }

      try {
        setUpdating(
          "clear-read"
        );

        await clearReadNotifications();

        setNotifications(
          (current) =>
            current.filter(
              (
                notification
              ) =>
                !notification.isRead
            )
        );
      } catch (error) {
        setError(
          error.message ||
            "Unable to clear read notifications."
        );
      } finally {
        setUpdating("");
      }
    };

  /* ==========================================
     DATE
  ========================================== */

  const formatDate =
    (value) => {
      if (!value) {
        return "";
      }

      return new Date(
        value
      ).toLocaleString(
        "en-IN",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short",
        }
      );
    };

  /* ==========================================
     ICON
  ========================================== */

  const getIcon =
    (type) => {
      switch (type) {
        case "new_order":
          return (
            <FaShoppingBag />
          );

        case "order_status":
          return (
            <FaTruck />
          );

        case "order_cancelled":
          return (
            <FaTimesCircle />
          );

        case "payment_success":
          return (
            <FaCreditCard />
          );

        case "payment_failed":
          return (
            <FaTimesCircle />
          );

        case "stock_update":
          return (
            <FaClock />
          );

        default:
          return (
            <FaBell />
          );
      }
    };

  /* ==========================================
     ORDER CLICK
  ========================================== */

  const handleNotificationClick =
    async (
      notification
    ) => {
      if (
        !notification
      ) {
        return;
      }

      if (
        !notification.isRead
      ) {
        await markAsRead(
          notification._id
        );
      }

      if (
        notification.order?._id
      ) {
        navigate(
          `/order/${notification.order._id}`
        );
      }
    };

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <div className="page-loader">
        <FaSpinner className="fa-spin" />

        Loading
        notifications...
      </div>
    );
  }

  /* ==========================================
     PAGE
  ========================================== */

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <span>
            FRESHCART
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated about
            your orders and
            payments.
          </p>
        </div>

        <div className="notifications-header-actions">
          <button
  type="button"
  className="professional-secondary-btn notification-back-btn"
  onClick={() => navigate(-1)}
  aria-label="Go back"
>
  <span>←</span>
  Back
</button>
          {unreadCount >
            0 && (
            <div className="notifications-count">
              {unreadCount}{" "}
              unread
            </div>
          )}

          <button
            type="button"
            disabled={
              refreshing
            }
            onClick={() =>
              loadNotifications(
                true
              )
            }
            className="professional-secondary-btn"
          >
            {refreshing ? (
              <FaSpinner className="fa-spin" />
            ) : (
              "Refresh"
            )}
          </button>

          {unreadCount >
            0 && (
            <button
              type="button"
              disabled={
                updating ===
                "all"
              }
              onClick={
                markAllRead
              }
              className="professional-secondary-btn"
            >
              {updating ===
              "all" ? (
                <FaSpinner className="fa-spin" />
              ) : (
                <FaCheckDouble />
              )}

              Mark All Read
            </button>
          )}

          {notifications.some(
            (
              notification
            ) =>
              notification.isRead
          ) && (
            <button
              type="button"
              disabled={
                updating ===
                "clear-read"
              }
              onClick={
                clearRead
              }
              className="professional-secondary-btn"
            >
              {updating ===
              "clear-read" ? (
                <FaSpinner className="fa-spin" />
              ) : (
                <FaTrash />
              )}

              Clear Read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}

      {!notifications.length ? (
        <div className="notifications-empty">
          <FaBell size={42} />

          <h2>
            No notifications
          </h2>

          <p>
            New order and payment
            updates will appear
            here.
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(
            (
              notification
            ) => (
              <article
                key={
                  notification._id
                }
                className={`notification-card ${
                  notification.isRead
                    ? "read"
                    : "unread"
                }`}
                onClick={() =>
                  handleNotificationClick(
                    notification
                  )
                }
              >
                <div className="notification-icon">
                  {getIcon(
                    notification.type
                  )}
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>
                      {
                        notification.title
                      }
                    </h3>

                    {!notification.isRead && (
                      <span className="notification-new-dot">
                        NEW
                      </span>
                    )}
                  </div>

                  <p>
                    {
                      notification.message
                    }
                  </p>

                  <div className="notification-meta">
                    <span>
                      <FaClock />

                      {formatDate(
                        notification.createdAt
                      )}
                    </span>

                    {notification
                      .order
                      ?._id && (
                      <span>
                        Order #
                        {String(
                          notification
                            .order
                            ._id
                        ).slice(
                          -8
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="notification-card-actions">
                  {!notification.isRead && (
                    <button
                      type="button"
                      className="notification-read-button"
                      disabled={
                        updating ===
                        notification._id
                      }
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        markAsRead(
                          notification._id
                        );
                      }}
                      aria-label="Mark notification as read"
                    >
                      {updating ===
                      notification._id ? (
                        <FaSpinner className="fa-spin" />
                      ) : (
                        <FaCheck />
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    className="notification-read-button"
                    disabled={
                      updating ===
                      `delete-${notification._id}`
                    }
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      deleteOne(
                        notification._id
                      );
                    }}
                    aria-label="Delete notification"
                  >
                    {updating ===
                    `delete-${notification._id}` ? (
                      <FaSpinner className="fa-spin" />
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;