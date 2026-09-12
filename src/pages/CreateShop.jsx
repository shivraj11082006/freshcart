import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FaStore,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCity,
  FaTruck,
  FaRupeeSign,
  FaClock,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaLocationArrow,
} from "react-icons/fa";

import { createShop } from "../api/api";

import {
  getCurrentBrowserLocation,
} from "../utils/location";

import "../App.css";

function CreateShop() {
  const navigate = useNavigate();

  /* =====================================================
     FORM DATA
  ===================================================== */

  const [formData, setFormData] = useState({
    shopName: "",
    phone: "",
    address: "",
    city: "",
    deliveryRadius: 5,
    deliveryCharge: 20,
    minimumOrder: 200,
    deliveryTime: "30–45 minutes",
    latitude: "",
    longitude: "",
  });

  /* =====================================================
     STATES
  ===================================================== */

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,

      [name]: [
        "deliveryRadius",
        "deliveryCharge",
        "minimumOrder",
      ].includes(name)
        ? Number(value)
        : value,
    }));

    setError("");
    setMessage("");
  };

  /* =====================================================
     VALIDATE FORM
  ===================================================== */

  const validate = () => {
    if (!formData.shopName.trim()) {
      return "Shop name is required.";
    }

    if (
      !/^[0-9]{10}$/.test(
        formData.phone.trim()
      )
    ) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!formData.address.trim()) {
      return "Shop address is required.";
    }

    if (!formData.city.trim()) {
      return "City / area is required.";
    }

    if (
      Number(formData.deliveryRadius) < 0
    ) {
      return "Delivery radius cannot be negative.";
    }

    if (
      Number(formData.deliveryCharge) < 0
    ) {
      return "Delivery charge cannot be negative.";
    }

    if (
      Number(formData.minimumOrder) < 0
    ) {
      return "Minimum order cannot be negative.";
    }

    if (
      !Number.isFinite(
        Number(formData.latitude)
      ) ||
      !Number.isFinite(
        Number(formData.longitude)
      )
    ) {
      return "Please set your real shop location.";
    }

    return "";
  };

  /* =====================================================
     GET CURRENT SHOP LOCATION
  ===================================================== */

  const useShopLocation = async () => {
    try {
      setLocationLoading(true);
      setError("");
      setMessage("");

      const location =
        await getCurrentBrowserLocation();

      setFormData((current) => ({
        ...current,

        latitude:
          location.latitude,

        longitude:
          location.longitude,
      }));

      setMessage(
        "Shop location captured successfully. Save the form to continue."
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to capture shop location."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  /* =====================================================
     SUBMIT FORM
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validate();

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await createShop({
        shopName:
          formData.shopName.trim(),

        phone:
          formData.phone.trim(),

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        deliveryRadius:
          Number(
            formData.deliveryRadius
          ),

        deliveryCharge:
          Number(
            formData.deliveryCharge
          ),

        minimumOrder:
          Number(
            formData.minimumOrder
          ),

        deliveryTime:
          formData.deliveryTime,

        latitude:
          Number(formData.latitude),

        longitude:
          Number(formData.longitude),

        isOpen: true,
      });

      setMessage(
        data?.message ||
          "Shop created successfully!"
      );

      setTimeout(() => {
        navigate(
          "/shopkeeper-dashboard",
          {
            replace: true,
          }
        );
      }, 900);
    } catch (error) {
      console.error(
        "Create shop error:",
        error
      );

      setError(
        error.message ||
          "Unable to create shop."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="create-shop-page">
      {/* Decorative Background */}
      <div className="create-shop-decoration create-shop-decoration-one" />

      <div className="create-shop-decoration create-shop-decoration-two" />

      {/* Back Button */}
      <Link
        to="/"
        className="create-shop-back"
      >
        <FaArrowLeft />
        Back to Home
      </Link>

      <div className="create-shop-container">
        {/* =================================================
            LEFT INFORMATION SECTION
        ================================================= */}

        <div className="create-shop-info">
          <div className="create-shop-icon">
            <FaStore />
          </div>

          <span className="create-shop-badge">
            FRESHCART SELLER
          </span>

          <h1>
            Start selling with
            FreshCart 🥬
          </h1>

          <p>
            Create your shop and
            start selling fresh
            vegetables, groceries
            and everyday products
            to nearby customers.
          </p>

          <div className="create-shop-benefits">
            <div>
              <FaCheckCircle />

              <span>
                Reach more local
                customers
              </span>
            </div>

            <div>
              <FaCheckCircle />

              <span>
                Manage products
                easily
              </span>
            </div>

            <div>
              <FaCheckCircle />

              <span>
                Receive and manage
                orders
              </span>
            </div>

            <div>
              <FaCheckCircle />

              <span>
                Grow your local
                business
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            FORM CARD
        ================================================= */}

        <div className="create-shop-form-card">
          {/* Heading */}

          <div className="create-shop-heading">
            <span>
              SHOP SETUP
            </span>

            <h2>
              Create Your Shop
            </h2>

            <p>
              Fill in your details
              to get started.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="create-shop-error">
              {error}
            </div>
          )}

          {/* Success */}

          {message && (
            <div className="create-shop-success">
              <FaCheckCircle />
              {message}
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="create-shop-form"
            onSubmit={handleSubmit}
          >
            {/* Shop Name */}

            <div className="create-shop-field">
              <label>
                Shop Name
              </label>

              <div className="create-shop-input">
                <FaStore />

                <input
                  type="text"
                  name="shopName"
                  placeholder="Enter your shop name"
                  value={
                    formData.shopName
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={100}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Phone */}

            <div className="create-shop-field">
              <label>
                Phone Number
              </label>

              <div className="create-shop-input">
                <FaPhoneAlt />

                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit phone number"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  inputMode="numeric"
                  maxLength={10}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Address */}

            <div className="create-shop-field">
              <label>
                Shop Address
              </label>

              <div className="create-shop-textarea">
                <FaMapMarkerAlt />

                <textarea
                  name="address"
                  placeholder="Enter your complete shop address"
                  value={
                    formData.address
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* City */}

            <div className="create-shop-field">
              <label>
                City / Area
              </label>

              <div className="create-shop-input">
                <FaCity />

                <input
                  type="text"
                  name="city"
                  placeholder="Example: Imphal"
                  value={
                    formData.city
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* =================================================
                REAL SHOP LOCATION
            ================================================= */}

            <div className="create-shop-field">
              <label>
                Real Shop Location
              </label>

              <button
                type="button"
                className="primary-button"
                onClick={
                  useShopLocation
                }
                disabled={
                  loading ||
                  locationLoading
                }
              >
                {locationLoading ? (
                  <FaSpinner className="fa-spin" />
                ) : (
                  <FaLocationArrow />
                )}

                {locationLoading
                  ? "Getting Location..."
                  : "Use Current Shop Location"}
              </button>

              {formData.latitude &&
                formData.longitude && (
                  <small>
                    Location saved:{" "}
                    {Number(
                      formData.latitude
                    ).toFixed(6)}
                    ,{" "}
                    {Number(
                      formData.longitude
                    ).toFixed(6)}
                  </small>
                )}
            </div>

            {/* =================================================
                DELIVERY SETTINGS
            ================================================= */}

            <div className="create-shop-section-title">
              <FaTruck />

              <div>
                <h3>
                  Delivery Settings
                </h3>

                <p>
                  Configure how you
                  deliver orders.
                </p>
              </div>
            </div>

            <div className="create-shop-grid">
              {/* Delivery Radius */}

              <div className="create-shop-field">
                <label>
                  Delivery Radius
                </label>

                <div className="create-shop-input">
                  <FaMapMarkerAlt />

                  <input
                    type="number"
                    name="deliveryRadius"
                    min="0"
                    max="100"
                    step="0.5"
                    value={
                      formData.deliveryRadius
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                  />
                </div>

                <small>
                  Distance in
                  kilometers.
                </small>
              </div>

              {/* Delivery Charge */}

              <div className="create-shop-field">
                <label>
                  Delivery Charge
                </label>

                <div className="create-shop-input">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="deliveryCharge"
                    min="0"
                    step="1"
                    value={
                      formData.deliveryCharge
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                  />
                </div>

                <small>
                  Enter 0 for free
                  delivery.
                </small>
              </div>

              {/* Minimum Order */}

              <div className="create-shop-field">
                <label>
                  Minimum Order
                </label>

                <div className="create-shop-input">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="minimumOrder"
                    min="0"
                    step="1"
                    value={
                      formData.minimumOrder
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                  />
                </div>

                <small>
                  Minimum cart amount.
                </small>
              </div>

              {/* Delivery Time */}

              <div className="create-shop-field">
                <label>
                  Delivery Time
                </label>

                <div className="create-shop-input">
                  <FaClock />

                  <select
                    name="deliveryTime"
                    value={
                      formData.deliveryTime
                    }
                    onChange={
                      handleChange
                    }
                    disabled={loading}
                  >
                    <option value="15–30 minutes">
                      15–30 minutes
                    </option>

                    <option value="30–45 minutes">
                      30–45 minutes
                    </option>

                    <option value="45–60 minutes">
                      45–60 minutes
                    </option>

                    <option value="1–2 hours">
                      1–2 hours
                    </option>

                    <option value="2–3 hours">
                      2–3 hours
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* =================================================
                SUBMIT BUTTON
            ================================================= */}

            <button
              type="submit"
              className="create-shop-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="fa-spin" />
                  Creating Your Shop...
                </>
              ) : (
                <>
                  <FaStore />
                  Create My Shop
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateShop;