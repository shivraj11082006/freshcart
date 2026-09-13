import { useEffect, useState } from "react";

import {
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaLeaf,
  FaMapMarkerAlt,
  FaChevronDown,
  FaTruck,
  FaShieldAlt,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaSpinner,
  FaBoxOpen,
  FaBell,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useCart,
} from "./context/CartContext";

import {
  getProducts,
  getNotifications,
} from "./api/api";

import "./App.css";

function App() {
  const {
    addToCart,
    cartCount,
  } = useCart();

  const navigate =
    useNavigate();

  const [search, setSearch] =
    useState("");

  const [products, setProducts] =
    useState([]);

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(true);

  const [
    addingProductId,
    setAddingProductId,
  ] = useState(null);

  const [
    addedProductId,
    setAddedProductId,
  ] = useState(null);

  const [
    cartMessage,
    setCartMessage,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState(() =>
    localStorage.getItem(
      "freshcartLocationSelected"
    ) === "true"
      ? "Current Location"
      : "Select Location"
  );

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const [
    gettingLocation,
    setGettingLocation,
  ] = useState(false);

  const [
    locationPickerOpen,
    setLocationPickerOpen,
  ] = useState(false);

  const [
    mobileMenu,
    setMobileMenu,
  ] = useState(false);

  const [
    unreadNotifications,
    setUnreadNotifications,
  ] = useState(0);

  let user = null;

  try {
    const storedUser =
      localStorage.getItem(
        "user"
      );

    user = storedUser
      ? JSON.parse(
          storedUser
        )
      : null;
  } catch {
    user = null;
  }

  const categories = [
    {
      name: "Vegetables",
      icon: "🥦",
    },
    {
      name: "Fruits",
      icon: "🍎",
    },
    {
      name: "Dairy",
      icon: "🥛",
    },
    {
      name: "Groceries",
      icon: "🛒",
    },
    {
      name: "Snacks",
      icon: "🍪",
    },
    {
      name: "Beverages",
      icon: "🥤",
    },
  ];

  useEffect(() => {
    let active = true;

    const loadProducts =
      async () => {
        try {
          setLoadingProducts(
            true
          );

          const data =
            await getProducts({
              includeOutOfStock:
                false,
            });

          if (!active)
            return;

          const list =
            Array.isArray(
              data?.products
            )
              ? data.products
              : [];

          setProducts(
            list.slice(0, 8)
          );
        } catch (
          error
        ) {
          console.error(
            "Failed to load homepage products:",
            error
          );

          if (active) {
            setProducts([]);
          }
        } finally {
          if (active) {
            setLoadingProducts(
              false
            );
          }
        }
      };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadNotifications =
      async () => {
        if (!user) {
          if (active) {
            setUnreadNotifications(
              0
            );
          }

          return;
        }

        try {
          const data =
            await getNotifications();

          if (!active)
            return;

          const notificationList =
            Array.isArray(
              data?.notifications
            )
              ? data.notifications
              : [];

          const unread =
            notificationList.filter(
              (
                notification
              ) =>
                !notification.isRead
            ).length;

          setUnreadNotifications(
            Number(
              data?.unreadCount ??
                unread
            )
          );
        } catch (
          error
        ) {
          console.error(
            "Failed to load notifications:",
            error
          );
        }
      };

    loadNotifications();

    const interval =
      setInterval(
        loadNotifications,
        30000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  const handleSearch =
    (event) => {
      event.preventDefault();

      const value =
        search.trim();

      if (value) {
        navigate(
          `/shop?search=${encodeURIComponent(
            value
          )}`
        );
      } else {
        navigate(
          "/shop"
        );
      }

      setMobileMenu(
        false
      );
    };

  const handleCategory =
    (category) => {
      navigate(
        `/shop?category=${encodeURIComponent(
          category
        )}`
      );

      setMobileMenu(
        false
      );
    };

  const canPurchase =
    (product) => {
      if (
        product?.isActive ===
        false
      ) {
        return false;
      }

      if (
        Number(
          product?.stock ||
            0
        ) <= 0
      ) {
        return false;
      }

      if (
        product?.shop
          ?.isOpen ===
        false
      ) {
        return false;
      }

      return true;
    };

  const handleAddToCart =
    async (
      product
    ) => {
      if (!user) {
        navigate(
          "/login"
        );

        return;
      }

      if (
        !canPurchase(
          product
        )
      ) {
        return;
      }

      try {
        setAddingProductId(
          product._id
        );

        setCartMessage(
          ""
        );

        await addToCart(
          product
        );

        setAddedProductId(
          product._id
        );

        setCartMessage(
          `${product.name} added to your cart.`
        );

        window.setTimeout(
          () => {
            setAddedProductId(
              null
            );

            setCartMessage(
              ""
            );
          },
          2200
        );
      } catch (
        error
      ) {
        setCartMessage(
          error.message ||
            "Unable to add product to cart."
        );
      } finally {
        setAddingProductId(
          null
        );
      }
    };

  const handleLocation =
    () => {
      setLocationMessage(
        ""
      );

      setMobileMenu(
        false
      );

      setLocationPickerOpen(
        true
      );
    };

  const handleUseCurrentLocation =
    () => {
      setLocationMessage(
        ""
      );

      if (
        !navigator.geolocation
      ) {
        setLocationMessage(
          "Location is not supported by your browser."
        );

        return;
      }

      setGettingLocation(
        true
      );

      navigator.geolocation.getCurrentPosition(
        (
          position
        ) => {
          const {
            latitude,
            longitude,
          } =
            position.coords;

          localStorage.setItem(
            "freshcartLatitude",
            String(
              latitude
            )
          );

          localStorage.setItem(
            "freshcartLongitude",
            String(
              longitude
            )
          );

          localStorage.setItem(
            "freshcartLocationSelected",
            "true"
          );

          setLocation(
            "Current Location"
          );

          setLocationPickerOpen(
            false
          );

          setLocationMessage(
            "Current location selected successfully."
          );

          setGettingLocation(
            false
          );
        },

        (error) => {
          console.error(
            "Location error:",
            error
          );

          let message =
            "Unable to get your location.";

          if (
            error.code === 1
          ) {
            message =
              "Location permission was denied. You can still browse FreshCart manually.";
          } else if (
            error.code === 2
          ) {
            message =
              "Your location could not be determined.";
          } else if (
            error.code === 3
          ) {
            message =
              "Location request timed out. Please try again.";
          }

          setLocationMessage(
            message
          );

          setGettingLocation(
            false
          );
        },

        {
          enableHighAccuracy:
            false,

          timeout:
            10000,

          maximumAge:
            300000,
        }
      );
    };

  return (
    <div className="app">
      <header className="main-header">
        <div className="header-container">
          <Link
            to="/"
            className="logo"
            aria-label="FreshCart Home"
          >
            <span className="logo-icon">
              🌿
            </span>

            <span>
              FreshCart
            </span>
          </Link>

          <nav
            className={`main-nav ${
              mobileMenu
                ? "mobile-nav-open"
                : ""
            }`}
          >
            <Link
              to="/"
              onClick={() =>
                setMobileMenu(
                  false
                )
              }
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={() =>
                setMobileMenu(
                  false
                )
              }
            >
              Shop
            </Link>

            {user && (
              <Link
                to="/orders"
                onClick={() =>
                  setMobileMenu(
                    false
                  )
                }
              >
                My Orders
              </Link>
            )}

            {user?.role ===
            "delivery_partner" ? (
              <Link
                to="/delivery-dashboard"
                onClick={() =>
                  setMobileMenu(
                    false
                  )
                }
              >
                🚚 Delivery Dashboard
              </Link>
            ) : (
              <Link
                to="/register?role=delivery_partner"
                onClick={() =>
                  setMobileMenu(
                    false
                  )
                }
              >
                🚚 Delivery Partner
              </Link>
            )}

            <button
              type="button"
              className="mobile-location-item"
              onClick={
                handleLocation
              }
            >
              <FaMapMarkerAlt />

              <span>
                Delivery location:{" "}
                {location}
              </span>

              <FaChevronDown />
            </button>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() =>
                setMobileMenu(
                  (current) =>
                    !current
                )
              }
              aria-label={
                mobileMenu
                  ? "Close menu"
                  : "Open menu"
              }
            >
              {mobileMenu ? (
                <FaTimes />
              ) : (
                <FaBars />
              )}
            </button>

            <button
              type="button"
              className="location-btn"
              onClick={
                handleLocation
              }
              aria-label="Select delivery location"
            >
              <FaMapMarkerAlt />

              <span>
                {location}
              </span>

              <FaChevronDown />
            </button>

            {user && (
              <Link
                to="/notifications"
                className="notification-header-btn"
              >
                <FaBell />

                {unreadNotifications >
                  0 && (
                  <span className="notification-count">
                    {unreadNotifications >
                    9
                      ? "9+"
                      : unreadNotifications}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/cart"
              className="cart-header-btn"
            >
              <FaShoppingCart />

              {cartCount > 0 && (
                <span className="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to="/account"
                className="account-header-btn"
              >
                <FaUser />

                <span>
                  {user.name?.split(
                    " "
                  )[0] ||
                    "Account"}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="login-header-btn"
              >
                <FaUser />
                Login
              </Link>
            )}
          </div>
        </div>

        {locationMessage && (
          <div
            className={`location-message ${
              locationMessage.includes(
                "successfully"
              )
                ? "success"
                : ""
            }`}
          >
            {locationMessage}
          </div>
        )}

        {locationPickerOpen && (
          <div
            className="location-modal-overlay"
            onClick={() =>
              setLocationPickerOpen(
                false
              )
            }
          >
            <div
              className="location-modal"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <div className="location-modal-header">
                <div>
                  <span className="location-modal-eyebrow">
                    FRESHCART
                  </span>

                  <h2>
                    Choose your location
                  </h2>

                  <p>
                    Select where you want
                    your groceries delivered.
                  </p>
                </div>

                <button
                  type="button"
                  className="location-modal-close"
                  onClick={() =>
                    setLocationPickerOpen(
                      false
                    )
                  }
                  aria-label="Close location selector"
                >
                  ×
                </button>
              </div>

              <div className="location-options">
                <button
                  type="button"
                  className="location-option"
                  onClick={() => {
                    setLocationPickerOpen(
                      false
                    );

                    setLocationMessage(
                      "Please select or add a delivery address during checkout."
                    );
                  }}
                >
                  <div className="location-option-icon">
                    📍
                  </div>

                  <div>
                    <strong>
                      Enter delivery location
                    </strong>

                    <span>
                      Choose your delivery address manually
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="location-option"
                  onClick={
                    handleUseCurrentLocation
                  }
                  disabled={
                    gettingLocation
                  }
                >
                  <div className="location-option-icon">
                    {gettingLocation ? (
                      <FaSpinner className="fa-spin" />
                    ) : (
                      <FaMapMarkerAlt />
                    )}
                  </div>

                  <div>
                    <strong>
                      {gettingLocation
                        ? "Getting location..."
                        : "Use current location"}
                    </strong>

                    <span>
                      Allow browser location access
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-badge">
                🌱 Fresh • Fast • Local
              </span>

              <h1>
                Fresh groceries
                <span>
                  delivered to your door.
                </span>
              </h1>

              <p>
                Discover products added by
                local shopkeepers and order
                fresh groceries easily.
              </p>

              <form
                className="hero-search"
                onSubmit={
                  handleSearch
                }
              >
                <FaSearch />

                <input
                  type="search"
                  placeholder="Search vegetables, fruits, groceries..."
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                />

                <button type="submit">
                  Search
                </button>
              </form>

              <div className="hero-buttons">
                <Link
                  to="/shop"
                  className="hero-primary-btn"
                >
                  Shop Now
                  <FaArrowRight />
                </Link>

                {!user && (
                  <Link
                    to="/register"
                    className="hero-secondary-btn"
                  >
                    Join FreshCart
                  </Link>
                )}
              </div>
            </div>

            <div className="hero-image-area">
              <div className="hero-emoji">
                🛒
              </div>

              <div className="hero-floating-card">
                🌿 Fresh products from
                local shops
              </div>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="section-header">
            <div>
              <span className="section-label">
                SHOP BY CATEGORY
              </span>

              <h2>
                What are you looking for?
              </h2>
            </div>

            <Link
              to="/shop"
              className="view-all-link"
            >
              View All
              <FaArrowRight />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map(
              (
                category
              ) => (
                <button
                  type="button"
                  key={
                    category.name
                  }
                  className="category-card"
                  onClick={() =>
                    handleCategory(
                      category.name
                    )
                  }
                >
                  <span className="category-icon">
                    {
                      category.icon
                    }
                  </span>

                  <strong>
                    {
                      category.name
                    }
                  </strong>

                  <small>
                    Browse products
                  </small>
                </button>
              )
            )}
          </div>
        </section>

        <section className="featured-section">
          <div className="section-header">
            <div>
              <span className="section-label">
                LATEST PRODUCTS
              </span>

              <h2>
                Fresh from our shopkeepers
              </h2>
            </div>

            <Link
              to="/shop"
              className="view-all-link"
            >
              View All
              <FaArrowRight />
            </Link>
          </div>

          {cartMessage && (
            <div
              className={`homepage-cart-message ${
                cartMessage.includes(
                  "added"
                )
                  ? "success"
                  : "error"
              }`}
            >
              {cartMessage.includes(
                "added"
              ) ? (
                <FaCheckCircle />
              ) : (
                <FaBoxOpen />
              )}

              <span>
                {cartMessage}
              </span>

              {cartMessage.includes(
                "added"
              ) && (
                <Link
                  to="/cart"
                  className="homepage-cart-message-link"
                >
                  View Cart
                </Link>
              )}
            </div>
          )}

          {loadingProducts ? (
            <div className="products-loading">
              <FaSpinner className="fa-spin" />

              <p>
                Loading fresh products...
              </p>
            </div>
          ) : products.length ===
            0 ? (
            <div className="empty-state">
              <FaBoxOpen
                size={45}
              />

              <h3>
                No products available yet
              </h3>

              <p>
                Products will appear here
                when shopkeepers add them.
              </p>

              <Link
                to="/shop"
                className="professional-primary-btn"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="featured-products-grid">
              {products.map(
                (
                  product
                ) => {
                  const available =
                    canPurchase(
                      product
                    );

                  const price =
                    Number(
                      product.price ||
                        0
                    );

                  const discount =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        Number(
                          product.discount ||
                            0
                        )
                      )
                    );

                  const finalPrice =
                    Math.max(
                      0,
                      price -
                        (price *
                          discount) /
                          100
                    );

                  return (
                    <div
                      className={`featured-product-card ${
                        !available
                          ? "customer-product-disabled"
                          : ""
                      }`}
                      key={
                        product._id
                      }
                    >
                      <div className="featured-product-image">
                        <Link
                          to={`/product/${product._id}`}
                        >
                          {product.image ? (
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              loading="lazy"
                            />
                          ) : (
                            <div className="product-image-placeholder">
                              🛒
                            </div>
                          )}
                        </Link>

                        {!available && (
                          <span className="product-status-badge product-status-out">
                            Unavailable
                          </span>
                        )}

                        {discount >
                          0 && (
                          <span className="product-discount-badge">
                            {discount}
                            % OFF
                          </span>
                        )}
                      </div>

                      <div className="featured-product-content">
                        <span className="product-category">
                          {
                            product.category
                          }
                        </span>

                        <Link
                          to={`/product/${product._id}`}
                          className="featured-product-title-link"
                        >
                          <h3>
                            {
                              product.name
                            }
                          </h3>
                        </Link>

                        <p className="product-shopkeeper">
                          Sold by{" "}
                          {product
                            .shopkeeper
                            ?.name ||
                            "Local Shopkeeper"}
                        </p>

                        <div className="featured-product-bottom">
                          <div>
                            <strong className="product-price">
                              ₹
                              {finalPrice.toFixed(
                                2
                              )}
                            </strong>

                            {discount >
                              0 && (
                              <small>
                                <del>
                                  ₹
                                  {price.toFixed(
                                    2
                                  )}
                                </del>

                                {product.unit
                                  ? ` / ${product.unit}`
                                  : ""}
                              </small>
                            )}
                          </div>

                          <div className="featured-product-action-group">
                            <Link
                              to={`/product/${product._id}`}
                              className="featured-view-btn"
                              aria-label={`View ${product.name}`}
                            >
                              <FaEye />
                            </Link>

                            <button
                              type="button"
                              disabled={
                                !available ||
                                addingProductId ===
                                  product._id
                              }
                              onClick={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                              className={
                                available
                                  ? "mini-cart-btn"
                                  : "mini-cart-btn disabled-cart-btn"
                              }
                              aria-label={
                                available
                                  ? `Add ${product.name} to cart`
                                  : `${product.name} unavailable`
                              }
                            >
                              {addingProductId ===
                              product._id ? (
                                <FaSpinner className="fa-spin" />
                              ) : addedProductId ===
                                product._id ? (
                                <FaCheckCircle />
                              ) : (
                                <FaShoppingCart />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="benefits-section">
          <div className="benefit-card">
            <FaLeaf />

            <div>
              <h3>
                Fresh Products
              </h3>

              <p>
                Products directly from
                local shopkeepers.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <FaTruck />

            <div>
              <h3>
                Easy Delivery
              </h3>

              <p>
                Simple ordering and
                delivery tracking.
              </p>
            </div>
          </div>

          <div className="benefit-card">
            <FaShieldAlt />

            <div>
              <h3>
                Secure Ordering
              </h3>

              <p>
                Your order is processed
                safely.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="footer-content">
          <div>
            <h2>
              🌿 FreshCart
            </h2>

            <p>
              Fresh products from
              local shopkeepers.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/shop">
              Shop
            </Link>

            <Link to="/orders">
              My Orders
            </Link>

            <Link to="/account">
              Account
            </Link>

            {user && (
              <Link to="/notifications">
                Notifications
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;