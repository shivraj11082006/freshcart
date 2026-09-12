import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FaBox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaSyncAlt,
} from "react-icons/fa";

import {
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../api/api";

import ShopkeeperLayout from "./ShopkeeperLayout";

function MyProducts() {
  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [status, setStatus] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(null);

  const [notice, setNotice] =
    useState("");

  const loadProducts = async () => {
    try {
      setError("");

      const data =
        await getMyProducts();

      setProducts(
        Array.isArray(
          data?.products
        )
          ? data.products
          : []
      );
    } catch (error) {
      console.error(
        "Load my products error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your products."
      );

      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadProducts();
  };

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const getProductStatus =
    (product) => {
      const stock =
        Number(
          product.stock || 0
        );

      if (
        product.isActive === false
      ) {
        return "Disabled";
      }

      if (stock <= 0) {
        return "Out of Stock";
      }

      if (stock <= 10) {
        return "Low Stock";
      }

      return "Available";
    };

  const filteredProducts =
    useMemo(() => {
      const cleanSearch =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !cleanSearch ||
            String(
              product.name || ""
            )
              .toLowerCase()
              .includes(
                cleanSearch
              );

          const matchesCategory =
            category ===
              "All" ||
            product.category ===
              category;

          const productStatus =
            getProductStatus(
              product
            );

          const matchesStatus =
            status === "All" ||
            (status ===
              "Available" &&
              productStatus ===
                "Available") ||
            (status ===
              "Low Stock" &&
              productStatus ===
                "Low Stock") ||
            (status ===
              "Out of Stock" &&
              productStatus ===
                "Out of Stock") ||
            (status ===
              "Disabled" &&
              productStatus ===
                "Disabled");

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );
        }
      );
    }, [
      products,
      search,
      category,
      status,
    ]);

  const counts = useMemo(
    () => ({
      total: products.length,

      available:
        products.filter(
          (product) =>
            getProductStatus(
              product
            ) === "Available"
        ).length,

      low:
        products.filter(
          (product) =>
            getProductStatus(
              product
            ) === "Low Stock"
        ).length,

      out:
        products.filter(
          (product) =>
            getProductStatus(
              product
            ) === "Out of Stock"
        ).length,

      disabled:
        products.filter(
          (product) =>
            getProductStatus(
              product
            ) === "Disabled"
        ).length,
    }),
    [products]
  );

  const toggleAvailability =
    async (product) => {
      const id = product._id;

      if (
        product.isActive === false &&
        Number(product.stock || 0) <= 0
      ) {
        setNotice(
          "Add stock before enabling this product."
        );

        return;
      }

      try {
        setActionLoading(
          `toggle-${id}`
        );

        setError("");
        setNotice("");

        const formData =
          new FormData();

        formData.append(
          "isActive",
          String(
            product.isActive ===
              false
          )
        );

        const data =
          await updateProduct(
            id,
            formData
          );

        const updatedProduct =
          data?.product;

        setProducts(
          (current) =>
            current.map(
              (item) =>
                item._id === id
                  ? {
                      ...item,
                      ...(updatedProduct ||
                        {
                          isActive:
                            !item.isActive,
                        }),
                    }
                  : item
            )
        );

        setNotice(
          data?.message ||
            "Product availability updated."
        );
      } catch (error) {
        console.error(
          "Toggle product error:",
          error
        );

        setError(
          error.message ||
            "Unable to update product."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  const handleDelete =
    async (product) => {
      const confirmed =
        window.confirm(
          `Delete "${product.name}"? This cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          `delete-${product._id}`
        );

        setError("");
        setNotice("");

        await deleteProduct(
          product._id
        );

        setProducts(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                product._id
            )
        );

        setNotice(
          "Product deleted successfully."
        );
      } catch (error) {
        console.error(
          "Delete product error:",
          error
        );

        setError(
          error.message ||
            "Unable to delete product."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="sk-empty">
          <div className="sk-empty-icon">
            <FaSpinner className="fa-spin" />
          </div>

          <h2>
            Loading Products...
          </h2>

          <p>
            Getting your inventory.
          </p>
        </div>
      </ShopkeeperLayout>
    );
  }

  return (
    <ShopkeeperLayout>
      <div className="management-page">
        <div className="management-header">
          <div>
            <span>
              PRODUCT MANAGEMENT
            </span>

            <h1>
              My Products
            </h1>

            <p>
              Manage your inventory,
              pricing and product
              availability.
            </p>
          </div>

          <div className="management-header-actions">
            <button
              type="button"
              className="sk-outline-btn"
              disabled={refreshing}
              onClick={refresh}
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

        {error && (
          <div className="sk-warning">
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        {notice && (
          <div className="sk-success">
            <FaCheckCircle />
            {notice}
          </div>
        )}

        <div className="sk-stats">
          <div className="sk-stat">
            <div className="sk-stat-icon">
              <FaBox />
            </div>

            <div>
              <span>
                Total Products
              </span>

              <strong>
                {counts.total}
              </strong>
            </div>
          </div>

          <div className="sk-stat">
            <div className="sk-stat-icon">
              <FaCheckCircle />
            </div>

            <div>
              <span>
                Available
              </span>

              <strong>
                {counts.available}
              </strong>
            </div>
          </div>

          <div className="sk-stat">
            <div className="sk-stat-icon">
              <FaExclamationTriangle />
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {counts.low}
              </strong>
            </div>
          </div>

          <div className="sk-stat">
            <div className="sk-stat-icon">
              <FaTimesCircle />
            </div>

            <div>
              <span>
                Out of Stock
              </span>

              <strong>
                {counts.out}
              </strong>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <div className="sk-toolbar">
            <div className="sk-search">
              <FaSearch />

              <input
                type="search"
                placeholder="Search your products..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >
              {categories.map(
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

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Available">
                Available
              </option>

              <option value="Low Stock">
                Low Stock
              </option>

              <option value="Out of Stock">
                Out of Stock
              </option>

              <option value="Disabled">
                Disabled
              </option>
            </select>
          </div>
        )}

        <div className="sk-result-count">
          Showing{" "}
          <strong>
            {filteredProducts.length}
          </strong>{" "}
          of{" "}
          <strong>
            {products.length}
          </strong>{" "}
          products
        </div>

        {products.length === 0 ? (
          <div className="sk-empty">
            <div className="sk-empty-icon">
              <FaBox />
            </div>

            <h2>
              No products yet
            </h2>

            <p>
              Add your first product
              to start selling.
            </p>

            <Link
              to="/add-product"
              className="sk-primary-btn"
            >
              <FaPlus />
              Add Product
            </Link>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="sk-empty">
            <div className="sk-empty-icon">
              <FaSearch />
            </div>

            <h2>
              No matching products
            </h2>

            <p>
              Try another search or
              filter.
            </p>

            <button
              type="button"
              className="sk-outline-btn"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setStatus("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="sk-product-grid">
            {filteredProducts.map(
              (product) => {
                const productStatus =
                  getProductStatus(
                    product
                  );

                const stock =
                  Number(
                    product.stock ||
                      0
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

                return (
                  <article
                    className="sk-product-card"
                    key={
                      product._id
                    }
                  >
                    <div className="sk-product-img">
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
                          🛒
                        </span>
                      )}

                      <span
                        className={`sk-product-status ${productStatus
                          .toLowerCase()
                          .replace(
                            / /g,
                            "-"
                          )}`}
                      >
                        {productStatus}
                      </span>
                    </div>

                    <div className="sk-product-body">
                      <small>
                        {
                          product.category
                        }
                      </small>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="sk-product-price">
                        ₹
                        {finalPrice.toFixed(
                          2
                        )}

                        {discount >
                          0 && (
                          <del>
                            ₹
                            {price.toFixed(
                              2
                            )}
                          </del>
                        )}
                      </div>

                      <div className="sk-product-stock">
                        <span>
                          Stock
                        </span>

                        <strong
                          className={
                            stock <= 0
                              ? "danger"
                              : stock <=
                                10
                              ? "warning"
                              : ""
                          }
                        >
                          {stock}{" "}
                          {product.unit ||
                            ""}
                        </strong>
                      </div>

                      <div className="sk-product-actions">
                        <Link
                          to={`/edit-product/${product._id}`}
                          className="sk-product-action edit"
                        >
                          <FaEdit />
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="sk-product-action"
                          disabled={
                            actionLoading ===
                            `toggle-${product._id}`
                          }
                          onClick={() =>
                            toggleAvailability(
                              product
                            )
                          }
                        >
                          {actionLoading ===
                          `toggle-${product._id}` ? (
                            <FaSpinner className="fa-spin" />
                          ) : product.isActive ===
                            false ? (
                            <>
                              <FaEye />
                              Enable
                            </>
                          ) : (
                            <>
                              <FaEyeSlash />
                              Disable
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="sk-product-action delete"
                          disabled={
                            actionLoading ===
                            `delete-${product._id}`
                          }
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                        >
                          {actionLoading ===
                          `delete-${product._id}` ? (
                            <FaSpinner className="fa-spin" />
                          ) : (
                            <>
                              <FaTrash />
                              Delete
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
      </div>
    </ShopkeeperLayout>
  );
}

export default MyProducts;