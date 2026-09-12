import "./productDiscovery.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FaCheck,
  FaEye,
  FaFilter,
  FaSearch,
  FaShoppingCart,
  FaSpinner,
  FaStore,
  FaTimes,
} from "react-icons/fa";

import {
  getProductDiscoveryFilters,
  getProducts,
} from "../api/api";

import { useCart } from "../context/CartContext";

import {
  getCurrentBrowserLocation,
  getSavedCustomerLocation,
} from "../utils/location";

import "../App.css";

function Products() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const { addToCart } = useCart();

  /* =====================================================
     PRODUCT STATE
  ===================================================== */

  const [products, setProducts] =
    useState([]);

  const [filterData, setFilterData] =
    useState({
      categories: [],
      cities: [],
      shops: [],
      priceRange: {
        min: 0,
        max: 0,
      },
    });

  /* =====================================================
     LOADING / ERROR STATE
  ===================================================== */

  const [loading, setLoading] =
    useState(true);

  const [filtersLoading, setFiltersLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     CUSTOMER LOCATION
  ===================================================== */

  const [
    customerLocation,
    setCustomerLocation,
  ] = useState(() =>
    getSavedCustomerLocation()
  );

  const [locationLoading, setLocationLoading] =
    useState(false);

  /* =====================================================
     UI STATE
  ===================================================== */

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [addingProductId, setAddingProductId] =
    useState(null);

  const [addedProductId, setAddedProductId] =
    useState(null);

  /* =====================================================
     URL PARAM HELPER
  ===================================================== */

  const getParam = (
    key,
    fallback = ""
  ) => {
    return (
      searchParams.get(key) ??
      fallback
    );
  };

  /* =====================================================
     FILTER STATE
  ===================================================== */

  const [search, setSearch] =
    useState(getParam("search"));

  const [category, setCategory] =
    useState(
      getParam("category", "All")
    );

  const [minPrice, setMinPrice] =
    useState(getParam("minPrice"));

  const [maxPrice, setMaxPrice] =
    useState(getParam("maxPrice"));

  const [stockOnly, setStockOnly] =
    useState(
      getParam("stock") === "true"
    );

  const [shop, setShop] =
    useState(getParam("shop"));

  const [city, setCity] =
    useState(getParam("city"));

  const [sort, setSort] =
    useState(
      getParam("sort", "newest")
    );

  /* =====================================================
     LOAD FILTER OPTIONS
  ===================================================== */

  const loadFilterData = async () => {
    try {
      setFiltersLoading(true);

      const data =
        await getProductDiscoveryFilters();

      setFilterData({
        categories:
          Array.isArray(
            data?.categories
          )
            ? data.categories
            : [],

        cities:
          Array.isArray(
            data?.cities
          )
            ? data.cities
            : [],

        shops:
          Array.isArray(
            data?.shops
          )
            ? data.shops
            : [],

        priceRange:
          data?.priceRange || {
            min: 0,
            max: 0,
          },
      });
    } catch (error) {
      console.error(
        "Filter loading error:",
        error
      );
    } finally {
      setFiltersLoading(false);
    }
  };

  /* =====================================================
     GET CUSTOMER LOCATION
  ===================================================== */

  const useCustomerLocation = async () => {
    try {
      setLocationLoading(true);
      setError("");

      const location =
        await getCurrentBrowserLocation();

      setCustomerLocation(location);
    } catch (error) {
      setError(
        error.message ||
          "Unable to get your location."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  const loadProducts = async (
    overrideFilters = null
  ) => {
    try {
      setLoading(true);
      setError("");

      const activeFilters =
        overrideFilters || {
          search,
          category,
          minPrice,
          maxPrice,

          stock: stockOnly
            ? "true"
            : "",

          shop,
          city,
          sort,

          latitude:
            customerLocation?.latitude,

          longitude:
            customerLocation?.longitude,
        };

      const data = await getProducts({
        ...activeFilters,

        includeOutOfStock: true,
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

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL FILTER LOAD
  ===================================================== */

  useEffect(() => {
    loadFilterData();
  }, []);

  /* =====================================================
     LOAD PRODUCTS WHEN FILTERS CHANGE
  ===================================================== */

  useEffect(() => {
    loadProducts();
  }, [
    category,
    minPrice,
    maxPrice,
    stockOnly,
    shop,
    city,
    sort,
    customerLocation?.latitude,
    customerLocation?.longitude,
  ]);

  /* =====================================================
     UPDATE URL
  ===================================================== */

  const updateUrl = (values) => {
    const params =
      new URLSearchParams();

    if (values.search?.trim()) {
      params.set(
        "search",
        values.search.trim()
      );
    }

    if (
      values.category &&
      values.category !== "All"
    ) {
      params.set(
        "category",
        values.category
      );
    }

    if (values.minPrice !== "") {
      params.set(
        "minPrice",
        values.minPrice
      );
    }

    if (values.maxPrice !== "") {
      params.set(
        "maxPrice",
        values.maxPrice
      );
    }

    if (values.stockOnly) {
      params.set(
        "stock",
        "true"
      );
    }

    if (values.shop) {
      params.set(
        "shop",
        values.shop
      );
    }

    if (values.city) {
      params.set(
        "city",
        values.city
      );
    }

    if (
      values.sort &&
      values.sort !== "newest"
    ) {
      params.set(
        "sort",
        values.sort
      );
    }

    setSearchParams(params);
  };

  /* =====================================================
     CURRENT FILTER VALUES
  ===================================================== */

  const currentValues = () => ({
    search,
    category,
    minPrice,
    maxPrice,
    stockOnly,
    shop,
    city,
    sort,
  });

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = (event) => {
    event.preventDefault();

    const values =
      currentValues();

    updateUrl(values);

    loadProducts({
      ...values,

      latitude:
        customerLocation?.latitude,

      longitude:
        customerLocation?.longitude,
    });
  };

  /* =====================================================
     FILTER CHANGE
  ===================================================== */

  const handleFilterChange = (
    key,
    value
  ) => {
    const values = {
      ...currentValues(),
      [key]: value,
    };

    updateUrl(values);
  };

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setStockOnly(false);
    setShop("");
    setCity("");
    setSort("newest");

    setSearchParams({});
  };

  /* =====================================================
     PRODUCT AVAILABILITY
  ===================================================== */

  const canPurchase = (product) => {
    if (product?.availability) {
      return Boolean(
        product.availability
          .canPurchase
      );
    }

    return (
      product?.isActive !== false &&
      Number(product?.stock || 0) > 0 &&
      product?.shop?.isOpen !== false
    );
  };

  /* =====================================================
     PRODUCT STATUS
  ===================================================== */

  const getStatus = (product) => {
    if (
      product?.shop?.isOpen ===
      false
    ) {
      return {
        text: "Shop Closed",

        className:
          "product-status-shop-closed",
      };
    }

    if (
      product?.isActive === false
    ) {
      return {
        text: "Unavailable",

        className:
          "product-status-unavailable",
      };
    }

    if (
      Number(product?.stock || 0) <=
      0
    ) {
      return {
        text: "Out of Stock",

        className:
          "product-status-out",
      };
    }

    if (
      Number(product.stock) <= 5
    ) {
      return {
        text:
          `Only ${product.stock} left`,

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

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = async (
    product
  ) => {
    if (
      !canPurchase(product) ||
      addingProductId
    ) {
      return;
    }

    try {
      setAddingProductId(
        product._id
      );

      await addToCart(product);

      setAddedProductId(
        product._id
      );

      setTimeout(() => {
        setAddedProductId(null);
      }, 1500);
    } catch (error) {
      setError(
        error.message ||
          "Unable to add product to cart."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  /* =====================================================
     ACTIVE FILTER COUNT
  ===================================================== */

  const activeFilterCount =
    useMemo(() => {
      let count = 0;

      if (category !== "All") {
        count++;
      }

      if (minPrice !== "") {
        count++;
      }

      if (maxPrice !== "") {
        count++;
      }

      if (stockOnly) {
        count++;
      }

      if (shop) {
        count++;
      }

      if (city) {
        count++;
      }

      if (sort !== "newest") {
        count++;
      }

      return count;
    }, [
      category,
      minPrice,
      maxPrice,
      stockOnly,
      shop,
      city,
      sort,
    ]);

  /* =====================================================
     CATEGORY LIST
  ===================================================== */

  const categories = [
    "All",

    ...filterData.categories.filter(
      (item) => item !== "All"
    ),
  ];

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="customer-products-page">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="customer-products-heading discovery-heading">
        <div>
          <span className="sk-page-label">
            FRESHCART MARKET
          </span>

          <h1>
            Discover Fresh Products 🔎
          </h1>

          <p>
            Search products and find the
            best items from local shops.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={
              useCustomerLocation
            }
            disabled={
              locationLoading
            }
          >
            {locationLoading
              ? "Getting Location..."
              : "Use My Location"}
          </button>

          {customerLocation && (
            <small
              style={{
                display: "block",
                marginTop:
                  "0.5rem",
              }}
            >
              Showing shops that can
              deliver to your location.
            </small>
          )}
        </div>

        <div className="discovery-result-count">
          <strong>
            {loading
              ? "..."
              : products.length}
          </strong>

          <span>
            Products Found
          </span>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="stock-warning-box discovery-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Close error"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =================================================
          SEARCH
      ================================================= */}

      <form
        className="discovery-search-form"
        onSubmit={handleSearch}
      >
        <div className="discovery-search-box">
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

        <button
          type="button"
          className="discovery-filter-toggle"
          onClick={() =>
            setFiltersOpen(
              (current) => !current
            )
          }
        >
          <FaFilter />

          Filters

          {activeFilterCount > 0 && (
            <span>
              {activeFilterCount}
            </span>
          )}
        </button>
      </form>

      {/* =================================================
          CATEGORY FILTER
      ================================================= */}

      <div className="discovery-category-row">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={
              category === item
                ? "active"
                : ""
            }
            onClick={() => {
              setCategory(item);

              handleFilterChange(
                "category",
                item
              );
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* =================================================
          ADVANCED FILTERS
      ================================================= */}

      <div
        className={
          filtersOpen
            ? "discovery-filters open"
            : "discovery-filters"
        }
      >
        <div className="discovery-filter-header">
          <div>
            <h3>
              <FaFilter />
              Product Filters
            </h3>

            <p>
              Narrow down exactly what
              you want.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="discovery-clear-btn"
          >
            Clear All
          </button>
        </div>

        <div className="discovery-filter-grid">
          {/* Minimum Price */}

          <div className="discovery-filter-field">
            <label>
              Minimum Price
            </label>

            <input
              type="number"
              min="0"
              placeholder="₹ Min"
              value={minPrice}
              onChange={(event) => {
                const value =
                  event.target.value;

                setMinPrice(value);

                handleFilterChange(
                  "minPrice",
                  value
                );
              }}
            />
          </div>

          {/* Maximum Price */}

          <div className="discovery-filter-field">
            <label>
              Maximum Price
            </label>

            <input
              type="number"
              min="0"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(event) => {
                const value =
                  event.target.value;

                setMaxPrice(value);

                handleFilterChange(
                  "maxPrice",
                  value
                );
              }}
            />
          </div>

          {/* Sort */}

          <div className="discovery-filter-field">
            <label>
              Sort Products
            </label>

            <select
              value={sort}
              onChange={(event) => {
                const value =
                  event.target.value;

                setSort(value);

                handleFilterChange(
                  "sort",
                  value
                );
              }}
            >
              <option value="newest">
                Newest First
              </option>

              <option value="price_low">
                Price: Low to High
              </option>

              <option value="price_high">
                Price: High to Low
              </option>

              <option value="discount_high">
                Highest Discount
              </option>

              <option value="name_az">
                Name: A to Z
              </option>

              <option value="name_za">
                Name: Z to A
              </option>
            </select>
          </div>

          {/* City */}

          <div className="discovery-filter-field">
            <label>
              City
            </label>

            <select
              value={city}
              onChange={(event) => {
                const value =
                  event.target.value;

                setCity(value);

                handleFilterChange(
                  "city",
                  value
                );
              }}
            >
              <option value="">
                All Cities
              </option>

              {filterData.cities.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Shop */}

          <div className="discovery-filter-field">
            <label>
              Shop
            </label>

            <select
              value={shop}
              onChange={(event) => {
                const value =
                  event.target.value;

                setShop(value);

                handleFilterChange(
                  "shop",
                  value
                );
              }}
            >
              <option value="">
                All Shops
              </option>

              {filterData.shops.map(
                (item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.shopName}
                    {item.city
                      ? ` — ${item.city}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Stock Only */}

          <label className="discovery-stock-check">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(event) => {
                const value =
                  event.target.checked;

                setStockOnly(value);

                handleFilterChange(
                  "stockOnly",
                  value
                );
              }}
            />

            <span>
              <strong>
                In Stock Only
              </strong>

              <small>
                Hide unavailable products
              </small>
            </span>
          </label>
        </div>

        {filtersLoading && (
          <div className="discovery-filter-loading">
            <FaSpinner className="fa-spin" />

            Loading filter options...
          </div>
        )}
      </div>

      {/* =================================================
          PRODUCT RESULTS
      ================================================= */}

      {loading ? (
        <div className="page-loader">
          <FaSpinner className="fa-spin" />

          Discovering fresh products...
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state discovery-empty-state">
          <FaSearch />

          <h2>
            No products found
          </h2>

          <p>
            Try changing your search or
            clearing some filters.
          </p>

          <button
            type="button"
            className="professional-primary-btn"
            onClick={clearFilters}
          >
            <FaTimes />
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(
            (product) => {
              const status =
                getStatus(product);

              const price =
                Number(
                  product.price || 0
                );

              const discount =
                Number(
                  product.discount || 0
                );

              const finalPrice =
                Number(
                  product.finalPrice ??
                    Math.max(
                      0,
                      price -
                        (price *
                          discount) /
                          100
                    )
                );

              const available =
                canPurchase(product);

              return (
                <article
                  className="customer-product-card"
                  key={product._id}
                >
                  {/* =================================================
                      PRODUCT IMAGE
                  ================================================= */}

                  <div className="customer-product-image">
                    <Link
                      to={`/product/${product._id}`}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
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
                      {status.text}
                    </span>

                    {discount > 0 && (
                      <span className="product-discount-badge">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* =================================================
                      PRODUCT BODY
                  ================================================= */}

                  <div className="customer-product-body">
                    <span className="product-category-tag">
                      {product.category}
                    </span>

                    <Link
                      to={`/product/${product._id}`}
                    >
                      <h3>
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="product-description-preview">
                        {
                          product.description
                        }
                      </p>
                    )}

                    {/* Shop */}

                    <div className="discovery-shop-info">
                      <FaStore />

                      <div>
                        <strong>
                          {product.shop
                            ?.shopName ||
                            "Local Shop"}
                        </strong>

                        <small>
                          {product.shop
                            ?.city ||
                            "Local Area"}
                        </small>
                      </div>
                    </div>

                    {/* Price + Actions */}

                    <div className="featured-product-bottom">
                      <div>
                        <strong className="product-price">
                          ₹
                          {finalPrice.toFixed(
                            2
                          )}
                        </strong>

                        {discount > 0 && (
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

                        {discount === 0 &&
                          product.unit && (
                            <small>
                              /{" "}
                              {
                                product.unit
                              }
                            </small>
                          )}
                      </div>

                      <div className="featured-product-action-group">
                        {/* View */}

                        <Link
                          to={`/product/${product._id}`}
                          className="featured-view-btn"
                          aria-label={`View ${product.name}`}
                        >
                          <FaEye />
                        </Link>

                        {/* Add to cart */}

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
                          aria-label={`Add ${product.name} to cart`}
                        >
                          {addingProductId ===
                          product._id ? (
                            <FaSpinner className="fa-spin" />
                          ) : addedProductId ===
                            product._id ? (
                            <FaCheck />
                          ) : (
                            <FaShoppingCart />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default Products;