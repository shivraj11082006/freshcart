import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FaArrowRight,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaPlus,
  FaRupeeSign,
  FaShoppingBag,
  FaStore,
  FaSyncAlt,
  FaTruck,
} from "react-icons/fa";

import ShopkeeperLayout from "./ShopkeeperLayout";

import {
  getMyShop,
  getShopkeeperDashboard,
} from "../api/api";

function ShopkeeperDashboard() {
  const [
    shop,
    setShop,
  ] = useState(null);

  const [
    stats,
    setStats,
  ] = useState({});

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    lowStock,
    setLowStock,
  ] = useState([]);

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    topProducts,
    setTopProducts,
  ] = useState([]);

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

  /* =====================================================
     LOAD
  ===================================================== */

  const loadDashboard =
    async (
      silent = false
    ) => {
      try {
        if (silent) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        setError("");

        const [
          shopData,
          dashboardData,
        ] =
          await Promise.all([
            getMyShop(),
            getShopkeeperDashboard(),
          ]);

        const dashboard =
          dashboardData?.dashboard ||
          {};

        setShop(
          shopData?.shop ||
            dashboard?.shop ||
            null
        );

        setStats(
          dashboard?.stats ||
            {}
        );

        setProducts(
          Array.isArray(
            dashboard?.products
          )
            ? dashboard.products
            : []
        );

        setLowStock(
          Array.isArray(
            dashboard?.lowStock
          )
            ? dashboard.lowStock
            : []
        );

        setOrders(
          Array.isArray(
            dashboard?.orders
          )
            ? dashboard.orders
            : []
        );

        setTopProducts(
          Array.isArray(
            dashboard?.topProducts
          )
            ? dashboard.topProducts
            : []
        );
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(
          false
        );

        setRefreshing(
          false
        );
      }
    };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =====================================================
     NUMBERS
  ===================================================== */

  const number =
    (
      value,
      fallback = 0
    ) => {
      const result =
        Number(value);

      return Number.isFinite(
        result
      )
        ? result
        : fallback;
    };

  const totalProducts =
    number(
      stats.totalProducts
    );

  const totalOrders =
    number(
      stats.totalOrders
    );

  const pendingOrders =
    number(
      stats.pendingOrders
    );

  const deliveredOrders =
    number(
      stats.deliveredOrders
    );

  const revenue =
    number(
      stats.totalRevenue
    );

  const todayRevenue =
    number(
      stats.todayRevenue
    );

  const lowStockCount =
    number(
      stats.lowStockProducts
    );

  /* =====================================================
     ORDER STATUS
  ===================================================== */

  const statusLabel =
    (
      status
    ) => {
      const labels = {
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
        labels[
          status
        ] ||
        status ||
        "Pending"
      );
    };

  const statusClass =
    (
      status
    ) =>
      `sk-order-status ${
        status ||
        "pending"
      }`;

  /* =====================================================
     RECENT ACTIVE ORDERS
  ===================================================== */

  const activeOrders =
    useMemo(
      () =>
        orders
          .filter(
            (order) =>
              order.orderStatus !==
                "delivered" &&
              order.orderStatus !==
                "cancelled"
          )
          .slice(
            0,
            5
          ),
      [orders]
    );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="sk-empty">
          <div className="sk-empty-icon">
            <FaSyncAlt className="fa-spin" />
          </div>

          <h2>
            Loading dashboard...
          </h2>

          <p>
            Getting your shop data.
          </p>
        </div>
      </ShopkeeperLayout>
    );
  }

  /* =====================================================
     NO SHOP
  ===================================================== */

  if (!shop) {
    return (
      <ShopkeeperLayout>
        <div className="sk-empty">
          <div className="sk-empty-icon">
            <FaStore />
          </div>

          <h2>
            Create your shop
          </h2>

          <p>
            Set up your shop before
            adding products and
            accepting orders.
          </p>

          <Link
            to="/create-shop"
            className="sk-primary-btn"
          >
            <FaPlus />

            Create Shop
          </Link>
        </div>
      </ShopkeeperLayout>
    );
  }

  return (
    <ShopkeeperLayout>
      <div className="sk-dashboard-page">
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="sk-page-header">
          <div>
            <span className="sk-page-header-label">
              SHOPKEEPER PANEL
            </span>

            <h1>
              Welcome back,{" "}
              {shop.shopName}!
              {" "}👋
            </h1>

            <p>
              Manage your shop,
              products, orders and
              revenue from one place.
            </p>
          </div>

          <div className="sk-header-actions">
            <button
              type="button"
              className="sk-outline-btn"
              disabled={
                refreshing
              }
              onClick={() =>
                loadDashboard(true)
              }
            >
              <FaSyncAlt
                className={
                  refreshing
                    ? "fa-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <Link
              to="/add-product"
              className="sk-primary-btn"
            >
              <FaPlus />

              Add Product
            </Link>
          </div>
        </div>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="sk-warning">
            <FaExclamationTriangle />

            {error}
          </div>
        )}

        {/* ======================================
            SHOP STATUS
        ====================================== */}

        <div className="sk-welcome">
          <div className="sk-welcome-badge">
            <FaStore />
          </div>

          <div>
            <span>
              YOUR SHOP STATUS
            </span>

            <strong>
              {shop.isOpen
                ? "Your shop is open"
                : "Your shop is currently closed"}
            </strong>

            <p>
              {shop.isOpen
                ? "Customers can browse and place orders."
                : "Open your shop from settings to accept new orders."}
            </p>
          </div>

          <Link
            to="/shop-settings"
            className={`sk-shop-status ${
              shop.isOpen
                ? "open"
                : "closed"
            }`}
          >
            <span>
              {shop.isOpen
                ? "OPEN"
                : "CLOSED"}
            </span>

            <FaArrowRight />
          </Link>
        </div>

        {/* ======================================
            MAIN STATS
        ====================================== */}

        <div className="sk-stats">
          <Link
            to="/my-products"
            className="sk-stat"
          >
            <div className="sk-stat-icon">
              <FaBox />
            </div>

            <div>
              <span>
                Products
              </span>

              <strong>
                {totalProducts}
              </strong>
            </div>
          </Link>

          <Link
            to="/shopkeeper-orders"
            className="sk-stat"
          >
            <div className="sk-stat-icon">
              <FaShoppingBag />
            </div>

            <div>
              <span>
                Orders
              </span>

              <strong>
                {totalOrders}
              </strong>
            </div>
          </Link>

          <Link
            to="/shopkeeper-orders"
            className="sk-stat"
          >
            <div className="sk-stat-icon">
              <FaClock />
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {pendingOrders}
              </strong>
            </div>
          </Link>

          <div className="sk-stat">
            <div className="sk-stat-icon">
              <FaRupeeSign />
            </div>

            <div>
              <span>
                Revenue
              </span>

              <strong>
                ₹
                {revenue.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits:
                      2,
                  }
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* ======================================
            SECOND STATS
        ====================================== */}

        <div
          className="sk-stats"
          style={{
            marginTop:
              "16px",
          }}
        >
          <div className="sk-stat">
            <div className="sk-stat-icon">
              <FaTruck />
            </div>

            <div>
              <span>
                Delivered
              </span>

              <strong>
                {
                  deliveredOrders
                }
              </strong>
            </div>
          </div>

          <div className="sk-stat">
            <div className="sk-stat-icon">
              <FaRupeeSign />
            </div>

            <div>
              <span>
                Today
              </span>

              <strong>
                ₹
                {todayRevenue.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits:
                      2,
                  }
                )}
              </strong>
            </div>
          </div>

          <Link
            to="/my-products"
            className="sk-stat"
          >
            <div className="sk-stat-icon">
              <FaExclamationTriangle />
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {
                  lowStockCount
                }
              </strong>
            </div>
          </Link>

          <Link
            to="/shopkeeper-orders"
            className="sk-stat"
          >
            <div className="sk-stat-icon">
              <FaCheckCircle />
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {
                  deliveredOrders
                }
              </strong>
            </div>
          </Link>
        </div>

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <div className="sk-section">
          <div className="sk-section-heading">
            <div>
              <span>
                QUICK ACTIONS
              </span>

              <h2>
                Manage Your Shop
              </h2>
            </div>
          </div>

          <div className="sk-quick-actions">
            <Link
              to="/add-product"
              className="sk-quick-action"
            >
              <FaPlus />

              <div>
                <strong>
                  Add Product
                </strong>

                <span>
                  Add a new grocery
                  product
                </span>
              </div>
            </Link>

            <Link
              to="/my-products"
              className="sk-quick-action"
            >
              <FaBox />

              <div>
                <strong>
                  Manage Products
                </strong>

                <span>
                  Edit stock and prices
                </span>
              </div>
            </Link>

            <Link
              to="/shopkeeper-orders"
              className="sk-quick-action"
            >
              <FaShoppingBag />

              <div>
                <strong>
                  Manage Orders
                </strong>

                <span>
                  Process incoming
                  orders
                </span>
              </div>
            </Link>

            <Link
              to="/shop-settings"
              className="sk-quick-action"
            >
              <FaStore />

              <div>
                <strong>
                  Shop Settings
                </strong>

                <span>
                  Update shop details
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* ======================================
            LOW STOCK
        ====================================== */}

        <div className="sk-section">
          <div className="sk-section-heading">
            <div>
              <span>
                INVENTORY
              </span>

              <h2>
                Low Stock Products
              </h2>
            </div>

            <Link
              to="/my-products"
            >
              View all

              <FaArrowRight />
            </Link>
          </div>

          {lowStock.length ===
          0 ? (
            <div className="sk-empty sk-small-empty">
              <div className="sk-empty-icon">
                <FaCheckCircle />
              </div>

              <h3>
                Stock looks good
              </h3>

              <p>
                No products currently
                need restocking.
              </p>
            </div>
          ) : (
            <div className="sk-low-stock-list">
              {lowStock.map(
                (
                  product
                ) => (
                  <Link
                    key={
                      product._id
                    }
                    to={`/edit-product/${product._id}`}
                    className="sk-low-stock-item"
                  >
                    <div className="sk-low-stock-image">
                      {product.image ? (
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />
                      ) : (
                        <span>
                          🥬
                        </span>
                      )}
                    </div>

                    <div>
                      <strong>
                        {
                          product.name
                        }
                      </strong>

                      <span>
                        ₹
                        {Number(
                          product.price ||
                            0
                        ).toFixed(
                          2
                        )}
                      </span>
                    </div>

                    <div
                      className={`sk-stock-badge ${
                        Number(
                          product.stock ||
                            0
                        ) <= 0
                          ? "danger"
                          : "warning"
                      }`}
                    >
                      {Number(
                        product.stock ||
                          0
                      ) <=
                      0
                        ? "Out of stock"
                        : `${product.stock} left`}
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* ======================================
            RECENT ORDERS
        ====================================== */}

        <div className="sk-section">
          <div className="sk-section-heading">
            <div>
              <span>
                ORDERS
              </span>

              <h2>
                Recent Orders
              </h2>
            </div>

            <Link
              to="/shopkeeper-orders"
            >
              View all

              <FaArrowRight />
            </Link>
          </div>

          {activeOrders.length ===
          0 ? (
            <div className="sk-empty sk-small-empty">
              <div className="sk-empty-icon">
                <FaShoppingBag />
              </div>

              <h3>
                No active orders
              </h3>

              <p>
                New customer orders
                will appear here.
              </p>
            </div>
          ) : (
            <div className="sk-orders-list">
              {activeOrders.map(
                (
                  order
                ) => (
                  <Link
                    key={
                      order._id
                    }
                    to="/shopkeeper-orders"
                    className="sk-order-item"
                  >
                    <div>
                      <span>
                        ORDER #
                        {String(
                          order._id
                        ).slice(
                          -8
                        )}
                      </span>

                      <strong>
                        {order
                          .customer
                          ?.name ||
                          "Customer"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        {order
                          .items
                          ?.length ||
                          0}{" "}
                        product(s)
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

                    <div
                      className={statusClass(
                        order.orderStatus
                      )}
                    >
                      {
                        statusLabel(
                          order.orderStatus
                        )
                      }
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>

        {/* ======================================
            TOP PRODUCTS
        ====================================== */}

        <div className="sk-section">
          <div className="sk-section-heading">
            <div>
              <span>
                PERFORMANCE
              </span>

              <h2>
                Top Selling Products
              </h2>
            </div>
          </div>

          {topProducts.length ===
          0 ? (
            <div className="sk-empty sk-small-empty">
              <div className="sk-empty-icon">
                <FaBox />
              </div>

              <h3>
                No sales data yet
              </h3>

              <p>
                Delivered orders will
                build your product
                performance data.
              </p>
            </div>
          ) : (
            <div className="sk-top-products">
              {topProducts.map(
                (
                  product,
                  index
                ) => (
                  <div
                    key={
                      product._id ||
                      index
                    }
                    className="sk-top-product"
                  >
                    <span className="sk-top-rank">
                      #
                      {index + 1}
                    </span>

                    <div className="sk-top-product-image">
                      {product.image ? (
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />
                      ) : (
                        "🥬"
                      )}
                    </div>

                    <div>
                      <strong>
                        {
                          product.name
                        }
                      </strong>

                      <span>
                        {
                          product.quantity
                        }{" "}
                        sold
                      </span>
                    </div>

                    <strong>
                      ₹
                      {Number(
                        product.sales ||
                          0
                      ).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </ShopkeeperLayout>
  );
}

export default ShopkeeperDashboard;