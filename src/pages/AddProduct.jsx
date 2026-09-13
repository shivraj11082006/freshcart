import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaImage,
  FaSpinner,
  FaCheckCircle,
  FaTrash,
  FaArrowLeft,
} from "react-icons/fa";

import {
  addProduct,
} from "../api/api";

import "../App.css";

import ShopkeeperLayout from "./ShopkeeperLayout";

function AddProduct() {
  const navigate =
    useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      category: "Vegetables",
      price: "",
      discount: "0",
      stock: "",
      unit: "kg",
      image: null,
      imagePreview: "",
      description: "",
      minimumOrder: 1,

      // New products are active by default.
      // If stock is 0, the stock handler will
      // automatically make the product inactive.
      isActive: true,
    });

  const [availabilityManuallySet, setAvailabilityManuallySet] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    return () => {
      if (
        formData.imagePreview
      ) {
        URL.revokeObjectURL(
          formData.imagePreview
        );
      }
    };
  }, []);

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        (current) => {
          if (name === "stock") {
            const stockValue =
              Number(value);

            if (
              !availabilityManuallySet
            ) {
              return {
                ...current,
                [name]: value,
                isActive:
                  Number.isFinite(stockValue) &&
                  stockValue > 0,
              };
            }

            return {
              ...current,
              [name]: value,
              isActive:
                Number.isFinite(stockValue) &&
                stockValue > 0
                  ? current.isActive
                  : false,
            };
          }

          return {
            ...current,
            [name]: value,
          };
        }
      );

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
        setMessage(
          "Please choose a valid image."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setMessage(
          "Image must be smaller than 5MB."
        );

        return;
      }

      if (
        formData.imagePreview
      ) {
        URL.revokeObjectURL(
          formData.imagePreview
        );
      }

      const preview =
        URL.createObjectURL(
          file
        );

      setFormData(
        (current) => ({
          ...current,
          image: file,
          imagePreview:
            preview,
        })
      );

      setMessage("");
    };

  const removeImage =
    () => {
      if (
        formData.imagePreview
      ) {
        URL.revokeObjectURL(
          formData.imagePreview
        );
      }

      setFormData(
        (current) => ({
          ...current,
          image: null,
          imagePreview: "",
        })
      );
    };

  const handleAvailability =
    () => {
      const stock =
        Number(
          formData.stock
        );

      if (
        !Number.isFinite(stock) ||
        stock <= 0
      ) {
        setFormData(
          (current) => ({
            ...current,
            isActive: false,
          })
        );

        setMessage(
          "Add stock greater than 0 before activating this product."
        );

        return;
      }

      setAvailabilityManuallySet(true);

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
        setMessage(
          "Please enter the product name."
        );
        return;
      }

      if (
        !Number.isFinite(
          price
        ) ||
        price <= 0
      ) {
        setMessage(
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
        setMessage(
          "Stock cannot be negative."
        );
        return;
      }

      if (
        discount < 0 ||
        discount > 100
      ) {
        setMessage(
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
        setMessage(
          "Minimum order must be at least 1."
        );
        return;
      }

      if (
        minimumOrder >
        stock &&
        stock > 0
      ) {
        setMessage(
          "Minimum order cannot be greater than available stock."
        );
        return;
      }

      if (
        !formData.description.trim()
      ) {
        setMessage(
          "Please add a product description."
        );
        return;
      }

      if (!formData.image) {
        setMessage(
          "Please select a product image."
        );
        return;
      }

      try {
        setLoading(true);

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

        /*
          Product is active by default when
          stock is greater than 0.

          If stock is 0, it will be inactive.
        */
        productData.append(
          "isActive",
          String(
            stock > 0 &&
              formData.isActive
          )
        );

        productData.append(
          "image",
          formData.image
        );

        const data =
          await addProduct(
            productData
          );

        setMessage(
          data?.message ||
            "Product added successfully!"
        );

        setTimeout(() => {
          navigate(
            "/my-products"
          );
        }, 700);
      } catch (error) {
        console.error(
          "Add product error:",
          error
        );

        setMessage(
          error.message ||
            "Unable to add product."
        );
      } finally {
        setLoading(false);
      }
    };

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
              Add Product 📦
            </h1>

            <span>
              Add clear information so
              customers know exactly
              what they are buying.
            </span>
          </div>

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
                      alt="Product preview"
                    />

                    <button
                      type="button"
                      onClick={
                        removeImage
                      }
                      className="remove-product-image"
                    >
                      <FaTrash />
                      Remove Picture
                    </button>
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
              </div>

              <small>
                Use a clear picture with
                the product centered.
              </small>
            </div>

            <div className="form-group">
              <label>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Example: Fresh Tomato"
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
                  placeholder="0.00"
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
                  placeholder="Available quantity"
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
                placeholder="Describe freshness, quality, pack size, etc."
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
                    : "Customers will not be able to purchase this product."}
                </span>
              </div>

              <button
                type="button"
                onClick={
                  handleAvailability
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="fa-spin" />
                  Saving Product...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Add Product
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </ShopkeeperLayout>
  );
}

export default AddProduct;