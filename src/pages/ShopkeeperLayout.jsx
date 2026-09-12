import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  FaChartPie,
  FaBox,
  FaPlus,
  FaShoppingBag,
  FaCog,
  FaStore,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaBell,
  FaCheckDouble,
  FaHome,
} from "react-icons/fa";

import {
  getMyShop,
  getUser,
  clearAuthData,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/api";

import "./shopkeeper.css";

function ShopkeeperLayout({
  children,
}) {
  const navigate =
    useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [shop, setShop] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const user = getUser();

  const loadShop =
    async () => {
      try {
        const data =
          await getMyShop();

        setShop(
          data?.shop || null
        );
      } catch (error) {
        console.error(
          "Load shop error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  const loadNotifications =
    async () => {
      try {
        const data =
          await getNotifications();

        const list =
          Array.isArray(
            data?.notifications
          )
            ? data.notifications
            : [];

        setNotifications(list);

        const unread =
          Number(
            data?.unreadCount
          );

        setUnreadCount(
          Number.isFinite(unread)
            ? unread
            : list.filter(
                (item) =>
                  !item.isRead
              ).length
        );
      } catch (error) {
        console.error(
          "Load notifications error:",
          error
        );
      }
    };

  useEffect(() => {
    loadShop();
    loadNotifications();

    const interval =
      setInterval(() => {
        loadNotifications();
      }, 30000);

    return () =>
      clearInterval(interval);
  }, []);

  const closeSidebar =
    () => {
      setSidebarOpen(false);
    };

  const logout = () => {
    clearAuthData();

    navigate("/login", {
      replace: true,
    });

    window.location.reload();
  };

  const handleNotification =
    async (notification) => {
      try {
        if (
          !notification.isRead
        ) {
          await markNotificationAsRead(
            notification._id
          );

          setNotifications(
            (current) =>
              current.map(
                (item) =>
                  item._id ===
                  notification._id
                    ? {
                        ...item,
                        isRead: true,
                      }
                    : item
              )
          );

          setUnreadCount(
            (current) =>
              Math.max(
                0,
                current - 1
              )
          );
        }

        setNotificationOpen(
          false
        );

        if (notification.order) {
          navigate(
            "/shopkeeper-orders"
          );
        }
      } catch (error) {
        console.error(
          "Notification error:",
          error
        );
      }
    };

  const markAllRead =
    async () => {
      try {
        await markAllNotificationsAsRead();

        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                isRead: true,
              })
            )
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Mark all notifications error:",
          error
        );
      }
    };

  const navItems = [
    {
      path: "/shopkeeper-dashboard",
      label: "Dashboard",
      icon: <FaChartPie />,
    },
    {
      path: "/my-products",
      label: "My Products",
      icon: <FaBox />,
    },
    {
      path: "/add-product",
      label: "Add Product",
      icon: <FaPlus />,
    },
    {
      path: "/shopkeeper-orders",
      label: "Orders",
      icon: <FaShoppingBag />,
    },
    {
      path: "/shop-settings",
      label: "Shop Settings",
      icon: <FaCog />,
    },
  ];

  return (
    <div className="sk-layout">
      {sidebarOpen && (
        <div
          className="sk-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`sk-sidebar ${
          sidebarOpen
            ? "open"
            : ""
        }`}
      >
        <div className="sk-sidebar-brand">
          <Link
            to="/shopkeeper-dashboard"
            className="sk-brand-link"
            onClick={closeSidebar}
          >
            <div className="sk-brand-icon">
              🌿
            </div>

            <div>
              <strong>
                Fresh<span>Cart</span>
              </strong>

              <small>
                Seller Panel
              </small>
            </div>
          </Link>

          <button
            type="button"
            className="sk-mobile-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="sk-shop-card">
          <div className="sk-shop-icon">
            <FaStore />
          </div>

          <div className="sk-shop-info">
            <span className="sk-shop-label">
              YOUR SHOP
            </span>

            <strong>
              {loading
                ? "Loading..."
                : shop?.shopName ||
                  "Create your shop"}
            </strong>

            <span
              className={
                shop?.isOpen
                  ? "sk-shop-open"
                  : "sk-shop-closed"
              }
            >
              <span />
              {shop?.isOpen
                ? "Open"
                : "Closed"}
            </span>
          </div>
        </div>

        <nav className="sk-navigation">
          <span className="sk-nav-title">
            MANAGEMENT
          </span>

          {navItems.map(
            (item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={
                  closeSidebar
                }
                className={({
                  isActive,
                }) =>
                  `sk-nav-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <span className="sk-nav-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sk-sidebar-bottom">
          <Link
            to="/"
            className="sk-view-store"
            onClick={closeSidebar}
          >
            <FaHome />
            Customer Home
          </Link>

          <Link
            to="/shop"
            className="sk-view-store"
            onClick={closeSidebar}
          >
            <FaStore />
            View Store
          </Link>

          <button
            type="button"
            className="sk-logout-btn"
            onClick={logout}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      <main className="sk-main">
        <header className="sk-header">
          <button
            type="button"
            className="sk-menu-btn"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open menu"
          >
            <FaBars />
          </button>

          <div className="sk-header-spacer" />

          <div className="notification-wrapper">
            <button
              type="button"
              className="notification-bell"
              onClick={() =>
                setNotificationOpen(
                  (value) => !value
                )
              }
              aria-label="Notifications"
            >
              <FaBell />

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <div>
                    <strong>
                      Notifications
                    </strong>

                    <span>
                      {unreadCount} unread
                    </span>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="read-all-btn"
                      onClick={
                        markAllRead
                      }
                    >
                      <FaCheckDouble />
                      Read all
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length ===
                  0 ? (
                    <div className="no-notifications">
                      <FaBell />
                      <span>
                        No notifications
                      </span>
                    </div>
                  ) : (
                    notifications
                      .slice(0, 12)
                      .map(
                        (
                          notification
                        ) => (
                          <button
                            type="button"
                            key={
                              notification._id
                            }
                            className={`notification-item ${
                              notification.isRead
                                ? ""
                                : "unread"
                            }`}
                            onClick={() =>
                              handleNotification(
                                notification
                              )
                            }
                          >
                            {!notification.isRead && (
                              <span className="unread-dot" />
                            )}

                            <div className="notification-item-content">
                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <span>
                                {
                                  notification.message
                                }
                              </span>

                              <small>
                                {notification.createdAt
                                  ? new Date(
                                      notification.createdAt
                                    ).toLocaleString(
                                      "en-IN"
                                    )
                                  : ""}
                              </small>
                            </div>
                          </button>
                        )
                      )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sk-user-area">
            <div className="sk-user-avatar">
              <FaUser />
            </div>

            <div className="sk-user-info">
              <strong>
                {user?.name ||
                  "Shopkeeper"}
              </strong>

              <span>
                Shopkeeper
              </span>
            </div>

            <Link
              to="/shop-settings"
              className="sk-profile-btn"
              aria-label="Shop settings"
            >
              <FaCog />
            </Link>
          </div>
        </header>

        <section className="sk-content">
          {children}
        </section>
      </main>
    </div>
  );
}

export default ShopkeeperLayout;