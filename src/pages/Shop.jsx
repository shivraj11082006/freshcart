import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaShoppingCart,
  FaSearch,
  FaSpinner,
  FaBoxOpen,
  FaStore,
  FaHome,
  FaEye,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getProducts,
} from "../api/api";

import {
  useCart,
} from "../context/CartContext";

import "../App.css";

function Shop() {
  const navigate =
    useNavigate();

  const {
    addToCart,
    cartCount,
  } = useCart();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [search, setSearch] =
    useState(
      searchParams.get(
        "search"
      ) || ""
    );

  const [category, setCategory] =
    useState(
      searchParams.get(
        "category"
      ) || "All"
    );

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    addingProductId,
    setAddingProductId,
  ] = useState(null);

  const [
    addedProductId,
    setAddedProductId,
  ] = useState(null);

  const loadProducts =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getProducts({
            search:
              search.trim(),

            category,

            includeOutOfStock:
              true,
          });

        setProducts(
          Array.isArray(
            data?.products
          )
            ? data.products
            : []
        );
      } catch (error) {
        setError(
          error.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    const timer =
      setTimeout(
        () => {
          loadProducts();
        },
        search.trim()
          ? 350
          : 0
      );

    return () =>
      clearTimeout(timer);
  }, [
    search,
    category,
  ]);

  const categories =
    useMemo(() => {
      const defaults = [
        "All",
        "Vegetables",
        "Fruits",
        "Dairy",
        "Groceries",
        "Snacks",
        "Beverages",
        "Personal Care",
        "Household",
      ];

      const backendCategories =
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean);

      return [
        ...new Set([
          ...defaults,
          ...backendCategories,
        ]),
      ];
    }, [products]);

  const updateUrl =
    (
      nextSearch,
      nextCategory
    ) => {
      const params =
        new URLSearchParams(
          searchParams
        );

      if (
        nextSearch.trim()
      ) {
        params.set(
          "search",
          nextSearch.trim()
        );
      } else {
        params.delete(
          "search"
        );
      }

      if (
        nextCategory !==
        "All"
      ) {
        params.set(
          "category",
          nextCategory
        );
      } else {
        params.delete(
          "category"
        );
      }

      setSearchParams(
        params
      );
    };

  const handleSearch =
    (event) => {
      event.preventDefault();

      updateUrl(
        search,
        category
      );

      loadProducts();
    };

  const isShopOpen =
    (product) => {
      if (!product?.shop) {
        return true;
      }

      return (
        product.shop.isOpen !==
        false
      );
    };

  const canPurchase =
    (product) => {
      return (
        product?.isActive !==
          false &&
        Number(
          product?.stock || 0
        ) > 0 &&
        isShopOpen(
          product
        )
      );
    };

  const getStatus =
    (product) => {
      if (
        !isShopOpen(
          product
        )
      ) {
        return {
          text: "Shop Closed",
          className:
            "product-status-shop-closed",
        };
      }

      if (
        product?.isActive ===
        false
      ) {
        return {
          text: "Unavailable",
          className:
            "product-status-unavailable",
        };
      }

      if (
        Number(
          product?.stock || 0
        ) <= 0
      ) {
        return {
          text: "Out of Stock",
          className:
            "product-status-out",
        };
      }

      if (
        Number(
          product.stock
        ) <= 5
      ) {
        return {
          text: `Only ${product.stock} left`,
          className:
            "product-status-low",
        };
      }

      return {
        text: "In Stock",
        className:
          "product-status-in",
      };
    };

  const handleAddToCart =
    async (
      event,
      product
    ) => {
      event.stopPropagation();

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

        setError("");

        await addToCart(
          product
        );

        setAddedProductId(
          product._id
        );

        setTimeout(() => {
          setAddedProductId(
            null
          );
        }, 1500);
      } catch (error) {
        setError(
          error.message ||
            "Unable to add product to cart."
        );
      } finally {
        setAddingProductId(
          null
        );
      }
    };

  return (
    <div className="shop-page-modern">
      <header className="shop-header">
        <div className="shop-header-inner">
          <Link
            to="/"
            className="professional-logo"
          >
            🌿 Fresh<span>Cart</span>
          </Link>

          <nav className="shop-header-nav">
            <Link to="/">
              <FaHome />
              Home
            </Link>

            <Link to="/orders">
              Orders
            </Link>

            <Link to="/account">
              Account
            </Link>
          </nav>

          <Link
            to="/cart"
            className="shop-cart-button"
          >
            <FaShoppingCart />

            <span>
              Cart
            </span>

            {cartCount > 0 && (
              <strong>
                {cartCount}
              </strong>
            )}
          </Link>
        </div>
      </header>

      <main className="shop-container">
        <div className="shop-heading">
          <div>
            <span>
              FRESHCART MARKET
            </span>

            <h1>
              Fresh Products 🥬
            </h1>

            <p>
              Shop fresh groceries
              from local stores.
            </p>
          </div>

          <div className="shop-heading-cart">
            <Link to="/cart">
              <FaShoppingCart />
              {cartCount > 0
                ? `${cartCount} items`
                : "Cart"}
            </Link>
          </div>
        </div>

        {error && (
          <div className="stock-warning-box">
            {error}
          </div>
        )}

        <form
          className="shop-search-bar"
          onSubmit={
            handleSearch
          }
        >
          <div className="product-search-box">
            <FaSearch />

            <input
              type="search"
              placeholder="Search vegetables, fruits, groceries..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <button
            type="submit"
            className="professional-primary-btn"
          >
            <FaSearch />
            Search
          </button>
        </form>

        <div className="shop-category-row">
          {categories.map(
            (item) => (
              <button
                type="button"
                key={item}
                className={
                  category ===
                  item
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setCategory(
                    item
                  );

                  updateUrl(
                    search,
                    item
                  );
                }}
              >
                {item}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="page-loader">
            <FaSpinner className="fa-spin" />
            Finding fresh products...
          </div>
        ) : products.length ===
          0 ? (
          <div className="empty-state">
            <FaBoxOpen />

            <h2>
              No products found
            </h2>

            <p>
              Try another search
              or category.
            </p>

            <button
              type="button"
              className="professional-outline-btn"
              onClick={() => {
                setSearch("");
                setCategory(
                  "All"
                );

                updateUrl(
                  "",
                  "All"
                );
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="shop-product-grid">
            {products.map(
              (product) => {
                const status =
                  getStatus(
                    product
                  );

                const price =
                  Number(
                    product.price ||
                      0
                  );

                const discount =
                  Number(
                    product.discount ||
                      0
                  );

                const finalPrice =
                  Math.max(
                    0,
                    price -
                      (price *
                        discount) /
                        100
                  );

                const available =
                  canPurchase(
                    product
                  );

                return (
                  <article
                    key={
                      product._id
                    }
                    className="shop-product-card"
                  >
                    <div className="shop-product-image">
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
                          <span>
                            🥬
                          </span>
                        )}
                      </Link>

                      <span
                        className={
                          status.className
                        }
                      >
                        {
                          status.text
                        }
                      </span>

                      {discount >
                        0 && (
                        <span className="product-discount-badge">
                          {discount}%
                          OFF
                        </span>
                      )}
                    </div>

                    <div className="shop-product-body">
                      <span className="product-category-tag">
                        {
                          product.category
                        }
                      </span>

                      <Link
                        to={`/product/${product._id}`}
                      >
                        <h3>
                          {
                            product.name
                          }
                        </h3>
                      </Link>

                      {product.shop && (
                        <small className="product-shop-name">
                          <FaStore />
                          {
                            product
                              .shop
                              .shopName
                          }
                        </small>
                      )}

                      <div className="shop-product-price">
                        <strong>
                          ₹
                          {finalPrice.toFixed(
                            2
                          )}
                        </strong>

                        {discount >
                          0 && (
                          <del>
                            ₹
                            {price.toFixed(
                              2
                            )}
                          </del>
                        )}

                        {product.unit && (
                          <span>
                            /{" "}
                            {
                              product.unit
                            }
                          </span>
                        )}
                      </div>

                      <div className="shop-product-actions">
                        <Link
                          to={`/product/${product._id}`}
                          className="product-view-btn"
                        >
                          <FaEye />
                          View
                        </Link>

                        <button
                          type="button"
                          className="product-cart-btn"
                          disabled={
                            !available ||
                            addingProductId ===
                              product._id
                          }
                          onClick={(
                            event
                          ) =>
                            handleAddToCart(
                              event,
                              product
                            )
                          }
                        >
                          {addingProductId ===
                          product._id ? (
                            <FaSpinner className="fa-spin" />
                          ) : addedProductId ===
                            product._id ? (
                            "✓ Added"
                          ) : (
                            <>
                              <FaShoppingCart />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Shop;