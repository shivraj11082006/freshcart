import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaSpinner,
  FaCheckCircle,
  FaTrash,
  FaImage,
  FaArrowLeft,
} from "react-icons/fa";

import {
  getProduct,
  updateProduct,
} from "../api/api";

import "../App.css";

import ShopkeeperLayout from "./ShopkeeperLayout";

function EditProduct() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    let active = true;

    const loadProduct =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getProduct(id);

          const product =
            data?.product || data;

          if (!product) {
            throw new Error(
              "Product not found."
            );
          }

          if (active) {
            setFormData({
              name:
                product.name ||
                "",

              category:
                product.category ||
                "Vegetables",

              price:
                product.price ??
                "",

              discount:
                product.discount ??
                0,

              stock:
                product.stock ??
                0,

              unit:
                product.unit ||
                "kg",

              image:
                product.image ||
                "",

              imageFile:
                null,

              imagePreview:
                product.image ||
                "",

              description:
                product.description ||
                "",

              minimumOrder:
                product.minimumOrder ||
                1,

              isActive:
                product.isActive !==
                false,
            });
          }
        } catch (error) {
          if (active) {
            setError(
              error.message ||
                "Unable to load product."
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        (current) => ({
          ...current,
          [name]: value,
        })
      );

      setError("");
      setMessage("");
    };

  const handleImageUpload =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please choose a valid image."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Image must be smaller than 5MB."
        );

        return;
      }

      const preview =
        URL.createObjectURL(
          file
        );

      if (
        formData.imagePreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          formData.imagePreview
        );
      }

      setFormData(
        (current) => ({
          ...current,
          imageFile:
            file,
          imagePreview:
            preview,
        })
      );

      setError("");
    };

  const removeNewImage =
    () => {
      if (
        formData.imagePreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          formData.imagePreview
        );
      }

      setFormData(
        (current) => ({
          ...current,
          imageFile: null,
          imagePreview:
            current.image,
        })
      );
    };

  const toggleAvailability =
    () => {
      const stock =
        Number(
          formData.stock
        );

      if (
        stock <= 0
      ) {
        setFormData(
          (current) => ({
            ...current,
            isActive: false,
          })
        );

        setMessage(
          "Product with zero stock is automatically inactive."
        );

        return;
      }

      setFormData(
        (current) => ({
          ...current,
          isActive:
            !current.isActive,
        })
      );

      setMessage("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const name =
        formData.name.trim();

      const price =
        Number(
          formData.price
        );

      const discount =
        Number(
          formData.discount
        ) || 0;

      const stock =
        Number(
          formData.stock
        );

      const minimumOrder =
        Number(
          formData.minimumOrder
        );

      if (!name) {
        setError(
          "Product name is required."
        );

        return;
      }

      if (
        !Number.isFinite(
          price
        ) ||
        price <= 0
      ) {
        setError(
          "Price must be greater than ₹0."
        );

        return;
      }

      if (
        !Number.isFinite(
          stock
        ) ||
        stock < 0
      ) {
        setError(
          "Stock cannot be negative."
        );

        return;
      }

      if (
        discount < 0 ||
        discount > 100
      ) {
        setError(
          "Discount must be between 0 and 100."
        );

        return;
      }

      if (
        !Number.isInteger(
          minimumOrder
        ) ||
        minimumOrder < 1
      ) {
        setError(
          "Minimum order must be at least 1."
        );

        return;
      }

      if (
        stock > 0 &&
        minimumOrder >
          stock
      ) {
        setError(
          "Minimum order cannot be greater than stock."
        );

        return;
      }

      if (
        !formData.description.trim()
      ) {
        setError(
          "Please add a product description."
        );

        return;
      }

      try {
        setSaving(true);

        const productData =
          new FormData();

        productData.append(
          "name",
          name
        );

        productData.append(
          "category",
          formData.category
        );

        productData.append(
          "price",
          String(price)
        );

        productData.append(
          "discount",
          String(discount)
        );

        productData.append(
          "stock",
          String(stock)
        );

        productData.append(
          "unit",
          formData.unit
        );

        productData.append(
          "description",
          formData.description.trim()
        );

        productData.append(
          "minimumOrder",
          String(
            minimumOrder
          )
        );

        productData.append(
          "isActive",
          String(
            stock > 0 &&
              formData.isActive
          )
        );

        if (
          formData.imageFile
        ) {
          productData.append(
            "image",
            formData.imageFile
          );
        }

        const data =
          await updateProduct(
            id,
            productData
          );

        setMessage(
          data?.message ||
            "Product updated successfully!"
        );

        const updated =
          data?.product;

        if (updated) {
          setFormData(
            (current) => ({
              ...current,

              name:
                updated.name ||
                current.name,

              category:
                updated.category ||
                current.category,

              price:
                updated.price ??
                current.price,

              discount:
                updated.discount ??
                current.discount,

              stock:
                updated.stock ??
                current.stock,

              unit:
                updated.unit ||
                current.unit,

              image:
                updated.image ||
                current.image,

              imageFile:
                null,

              imagePreview:
                updated.image ||
                current.image,

              description:
                updated.description ||
                current.description,

              minimumOrder:
                updated.minimumOrder ||
                current.minimumOrder,

              isActive:
                updated.isActive !==
                false,
            })
          );
        }

        setTimeout(() => {
          navigate(
            "/my-products"
          );
        }, 700);
      } catch (error) {
        console.error(
          "Edit product error:",
          error
        );

        setError(
          error.message ||
            "Unable to update product."
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="empty-state">
          <FaSpinner className="fa-spin" />
          <h2>
            Loading product...
          </h2>
        </div>
      </ShopkeeperLayout>
    );
  }

  if (!formData) {
    return (
      <ShopkeeperLayout>
        <div className="empty-state">
          <h2>
            Product not found
          </h2>

          <p>
            {error}
          </p>

          <Link
            to="/my-products"
            className="primary-button"
          >
            Back to Products
          </Link>
        </div>
      </ShopkeeperLayout>
    );
  }

  const price =
    Number(
      formData.price
    ) || 0;

  const discount =
    Number(
      formData.discount
    ) || 0;

  const finalPrice =
    Math.max(
      0,
      price -
        (price *
          discount) /
          100
    );

  return (
    <ShopkeeperLayout>
      <div className="form-page">
        <div className="form-container">
          <div className="page-top-nav">
            <button
              type="button"
              className="back-btn"
              onClick={() =>
                navigate(
                  "/my-products"
                )
              }
            >
              <FaArrowLeft />
              Products
            </button>

            <button
              type="button"
              className="home-btn"
              onClick={() =>
                navigate(
                  "/shopkeeper-dashboard"
                )
              }
            >
              Dashboard
            </button>
          </div>

          <div className="form-page-heading">
            <p>
              PRODUCT MANAGEMENT
            </p>

            <h1>
              Edit Product ✏️
            </h1>

            <span>
              Update your product details,
              price and stock.
            </span>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form
            className="main-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label>
                Product Picture
              </label>

              <div className="product-upload-box">
                {formData.imagePreview ? (
                  <div className="product-image-preview">
                    <img
                      src={
                        formData.imagePreview
                      }
                      alt={
                        formData.name
                      }
                    />

                    {formData.imageFile && (
                      <button
                        type="button"
                        onClick={
                          removeNewImage
                        }
                        className="remove-product-image"
                      >
                        <FaTrash />
                        Remove New Picture
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="image-upload-label">
                    <FaImage />

                    <strong>
                      Choose product picture
                    </strong>

                    <span>
                      JPG, PNG or WEBP •
                      Maximum 5MB
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleImageUpload
                      }
                    />
                  </label>
                )}

                {formData.imagePreview &&
                  !formData.imageFile && (
                    <label className="image-upload-label">
                      <FaImage />

                      <strong>
                        Change picture
                      </strong>

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleImageUpload
                        }
                      />
                    </label>
                  )}
              </div>
            </div>

            <div className="form-group">
              <label>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                maxLength={100}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Vegetables
                  </option>
                  <option>
                    Fruits
                  </option>
                  <option>
                    Dairy
                  </option>
                  <option>
                    Groceries
                  </option>
                  <option>
                    Snacks
                  </option>
                  <option>
                    Beverages
                  </option>
                  <option>
                    Personal Care
                  </option>
                  <option>
                    Household
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Unit
                </label>

                <select
                  name="unit"
                  value={
                    formData.unit
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="kg">
                    kg
                  </option>
                  <option value="g">
                    g
                  </option>
                  <option value="litre">
                    litre
                  </option>
                  <option value="ml">
                    ml
                  </option>
                  <option value="piece">
                    piece
                  </option>
                  <option value="pack">
                    pack
                  </option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Discount (%)
                </label>

                <input
                  type="number"
                  name="discount"
                  min="0"
                  max="100"
                  step="1"
                  value={
                    formData.discount
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>

            <div className="price-preview">
              <span>
                Customer price
              </span>

              <strong>
                ₹
                {finalPrice.toFixed(
                  2
                )}
              </strong>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Minimum Order
                </label>

                <input
                  type="number"
                  name="minimumOrder"
                  min="1"
                  step="1"
                  value={
                    formData.minimumOrder
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                rows="5"
                maxLength={1000}
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                required
              />
            </div>

            <div className="availability-box">
              <div>
                <strong>
                  Product Availability
                </strong>

                <span>
                  {formData.isActive &&
                  Number(
                    formData.stock
                  ) > 0
                    ? "Customers can purchase this product."
                    : "Customers cannot purchase this product."}
                </span>
              </div>

              <button
                type="button"
                onClick={
                  toggleAvailability
                }
                className={
                  formData.isActive
                    ? "available"
                    : "unavailable"
                }
              >
                {formData.isActive
                  ? "Active"
                  : "Inactive"}
              </button>
            </div>

            {message && (
              <div className="form-message">
                <FaCheckCircle />
                {message}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <FaSpinner className="fa-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </ShopkeeperLayout>
  );
}

export default EditProduct;