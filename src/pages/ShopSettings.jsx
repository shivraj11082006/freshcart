import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  FaStore,
  FaPhone,
  FaMapMarkerAlt,
  FaTruck,
  FaRupeeSign,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaSave,
  FaArrowLeft,
  FaLocationArrow,
} from "react-icons/fa";

import {
  getMyShop,
  updateShop,
  toggleShopStatus,
} from "../api/api";

import {
  getCurrentBrowserLocation,
} from "../utils/location";

import "../App.css";

import ShopkeeperLayout from "./ShopkeeperLayout";

function ShopSettings() {
  /* =====================================================
     SHOP STATE
  ===================================================== */

  const [shop, setShop] = useState({
    shopName: "",
    phone: "",
    address: "",
    city: "",
    deliveryRadius: 5,
    deliveryCharge: 20,
    minimumOrder: 200,
    deliveryTime: "30–45 minutes",
    description: "",
    isOpen: true,
    latitude: "",
    longitude: "",
  });

  /* =====================================================
     LOADING STATES
  ===================================================== */

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [toggling, setToggling] = useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  /* =====================================================
     MESSAGE STATES
  ===================================================== */

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* =====================================================
     LOAD SHOP
  ===================================================== */

  useEffect(() => {
    loadShop();
  }, []);

  const loadShop = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyShop();

      if (data?.shop) {
        setShop({
          shopName:
            data.shop.shopName || "",

          phone:
            data.shop.phone || "",

          address:
            data.shop.address || "",

          city:
            data.shop.city || "",

          deliveryRadius:
            data.shop.deliveryRadius ?? 5,

          deliveryCharge:
            data.shop.deliveryCharge ?? 20,

          minimumOrder:
            data.shop.minimumOrder ?? 200,

          deliveryTime:
            data.shop.deliveryTime ||
            "30–45 minutes",

          description:
            data.shop.description || "",

          latitude:
            data.shop.location?.latitude ?? "",

          longitude:
            data.shop.location?.longitude ?? "",

          isOpen:
            data.shop.isOpen !== false,
        });
      }
    } catch (error) {
      setError(
        error.message ||
          "Unable to load shop settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setShop((current) => ({
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
    if (!shop.shopName.trim()) {
      return "Shop name is required.";
    }

    if (
      !/^[0-9]{10}$/.test(
        shop.phone.trim()
      )
    ) {
      return "Enter a valid 10-digit phone number.";
    }

    if (!shop.address.trim()) {
      return "Shop address is required.";
    }

    if (!shop.city.trim()) {
      return "City is required.";
    }

    if (
      Number(shop.deliveryRadius) < 0
    ) {
      return "Delivery radius cannot be negative.";
    }

    if (
      Number(shop.deliveryCharge) < 0
    ) {
      return "Delivery charge cannot be negative.";
    }

    if (
      Number(shop.minimumOrder) < 0
    ) {
      return "Minimum order cannot be negative.";
    }

    if (
      !Number.isFinite(
        Number(shop.latitude)
      ) ||
      !Number.isFinite(
        Number(shop.longitude)
      )
    ) {
      return "Please set your real shop location.";
    }

    return "";
  };

  /* =====================================================
     TOGGLE SHOP STATUS
  ===================================================== */

  const handleToggle = async () => {
    try {
      setToggling(true);
      setMessage("");
      setError("");

      const data =
        await toggleShopStatus();

      if (data?.shop) {
        setShop((current) => ({
          ...current,
          isOpen:
            data.shop.isOpen,
        }));
      } else if (
        typeof data?.isOpen ===
        "boolean"
      ) {
        setShop((current) => ({
          ...current,
          isOpen:
            data.isOpen,
        }));
      } else {
        setShop((current) => ({
          ...current,
          isOpen:
            !current.isOpen,
        }));
      }

      setMessage(
        data?.message ||
          "Shop status updated."
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to update shop status."
      );
    } finally {
      setToggling(false);
    }
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

      setShop((current) => ({
        ...current,

        latitude:
          location.latitude,

        longitude:
          location.longitude,
      }));

      setMessage(
        "New shop location captured. Save settings to apply it."
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
     SAVE SHOP SETTINGS
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validate();

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        shopName:
          shop.shopName.trim(),

        phone:
          shop.phone.trim(),

        address:
          shop.address.trim(),

        city:
          shop.city.trim(),

        deliveryRadius:
          Number(shop.deliveryRadius),

        deliveryCharge:
          Number(shop.deliveryCharge),

        minimumOrder:
          Number(shop.minimumOrder),

        deliveryTime:
          shop.deliveryTime,

        latitude:
          Number(shop.latitude),

        longitude:
          Number(shop.longitude),

        description:
          shop.description.trim(),

        isOpen:
          shop.isOpen,
      };

      const data =
        await updateShop(payload);

      if (data?.shop) {
        setShop({
          shopName:
            data.shop.shopName ||
            "",

          phone:
            data.shop.phone ||
            "",

          address:
            data.shop.address ||
            "",

          city:
            data.shop.city ||
            "",

          deliveryRadius:
            data.shop.deliveryRadius ??
            0,

          deliveryCharge:
            data.shop.deliveryCharge ??
            0,

          minimumOrder:
            data.shop.minimumOrder ??
            0,

          deliveryTime:
            data.shop.deliveryTime ||
            "30–45 minutes",

          description:
            data.shop.description ||
            "",

          latitude:
            data.shop.location?.latitude ??
            shop.latitude,

          longitude:
            data.shop.location?.longitude ??
            shop.longitude,

          isOpen:
            data.shop.isOpen !==
            false,
        });
      }

      setMessage(
        data?.message ||
          "Shop settings saved successfully."
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to save shop settings."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="sk-empty">
          <div className="sk-empty-icon">
            <FaSpinner className="fa-spin" />
          </div>

          <h2>
            Loading Shop Settings...
          </h2>
        </div>
      </ShopkeeperLayout>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <ShopkeeperLayout>
      <div className="form-page">
        <div className="form-card shop-settings-card">
          {/* =================================================
              TOP NAVIGATION
          ================================================= */}

          <div className="page-top-nav">
            <Link
              to="/shopkeeper-dashboard"
              className="back-btn"
            >
              <FaArrowLeft />
              Dashboard
            </Link>

            <Link
              to="/my-products"
              className="home-btn"
            >
              <FaStore />
              Products
            </Link>
          </div>

          {/* =================================================
              PAGE HEADING
          ================================================= */}

          <div className="settings-page-heading">
            <span>
              SHOPKEEPER PANEL
            </span>

            <h1>
              Shop Settings ⚙️
            </h1>

            <p>
              Keep your shop details,
              delivery settings and
              availability up to date.
            </p>
          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="form-message">
              <FaCheckCircle />
              {message}
            </div>
          )}

          {/* =================================================
              SHOP STATUS
          ================================================= */}

          <div className="shop-status-card">
            <div>
              <span>
                STORE STATUS
              </span>

              <strong>
                {shop.isOpen
                  ? "Your shop is open"
                  : "Your shop is closed"}
              </strong>

              <p>
                {shop.isOpen
                  ? "Customers can browse and place orders."
                  : "Customers will not be able to place new orders."}
              </p>
            </div>

            <button
              type="button"
              className={
                shop.isOpen
                  ? "shop-toggle open"
                  : "shop-toggle closed"
              }
              onClick={handleToggle}
              disabled={toggling}
            >
              {toggling ? (
                <FaSpinner className="fa-spin" />
              ) : (
                <>
                  <span />
                  {shop.isOpen
                    ? "Open"
                    : "Closed"}
                </>
              )}
            </button>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="main-form"
            onSubmit={handleSubmit}
          >
            {/* =================================================
                SHOP INFORMATION
            ================================================= */}

            <div className="form-section-title">
              <FaStore />

              <div>
                <h3>
                  Shop Information
                </h3>

                <p>
                  Information customers
                  will see.
                </p>
              </div>
            </div>

            {/* Shop Name */}

            <div className="form-group">
              <label>
                Shop Name
              </label>

              <div className="input-with-icon">
                <FaStore />

                <input
                  type="text"
                  name="shopName"
                  value={
                    shop.shopName
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={100}
                  disabled={saving}
                  required
                />
              </div>
            </div>

            {/* Phone + City */}

            <div className="form-row">
              <div className="form-group">
                <label>
                  Phone Number
                </label>

                <div className="input-with-icon">
                  <FaPhone />

                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    maxLength={10}
                    value={shop.phone}
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  City / Area
                </label>

                <div className="input-with-icon">
                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    name="city"
                    value={shop.city}
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}

            <div className="form-group">
              <label>
                Shop Address
              </label>

              <textarea
                name="address"
                rows="4"
                value={shop.address}
                onChange={
                  handleChange
                }
                disabled={saving}
                required
              />
            </div>

            {/* =================================================
                REAL SHOP LOCATION
            ================================================= */}

            <div className="form-group">
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
                  saving ||
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

              {shop.latitude &&
                shop.longitude && (
                  <small>
                    Location saved:{" "}
                    {Number(
                      shop.latitude
                    ).toFixed(6)}
                    ,{" "}
                    {Number(
                      shop.longitude
                    ).toFixed(6)}
                  </small>
                )}
            </div>

            {/* =================================================
                DELIVERY SETTINGS
            ================================================= */}

            <div className="form-section-title">
              <FaTruck />

              <div>
                <h3>
                  Delivery Settings
                </h3>

                <p>
                  Set your delivery
                  limits and pricing.
                </p>
              </div>
            </div>

            {/* Delivery Radius + Charge */}

            <div className="form-row">
              <div className="form-group">
                <label>
                  Delivery Radius
                </label>

                <div className="input-with-icon">
                  <FaMapMarkerAlt />

                  <input
                    type="number"
                    name="deliveryRadius"
                    min="0"
                    max="100"
                    step="0.5"
                    value={
                      shop.deliveryRadius
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />
                </div>

                <small>
                  Distance in
                  kilometers.
                </small>
              </div>

              <div className="form-group">
                <label>
                  Delivery Charge
                </label>

                <div className="input-with-icon">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="deliveryCharge"
                    min="0"
                    step="1"
                    value={
                      shop.deliveryCharge
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />
                </div>

                <small>
                  Use 0 for free delivery.
                </small>
              </div>
            </div>

            {/* Minimum Order + Delivery Time */}

            <div className="form-row">
              <div className="form-group">
                <label>
                  Minimum Order
                </label>

                <div className="input-with-icon">
                  <FaRupeeSign />

                  <input
                    type="number"
                    name="minimumOrder"
                    min="0"
                    step="1"
                    value={
                      shop.minimumOrder
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Delivery Time
                </label>

                <div className="input-with-icon">
                  <FaClock />

                  <select
                    name="deliveryTime"
                    value={
                      shop.deliveryTime
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
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
                DESCRIPTION
            ================================================= */}

            <div className="form-group">
              <label>
                Shop Description
              </label>

              <textarea
                name="description"
                rows="5"
                maxLength={1000}
                placeholder="Tell customers about your shop..."
                value={
                  shop.description
                }
                onChange={
                  handleChange
                }
                disabled={saving}
              />
            </div>

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <FaSpinner className="fa-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Shop Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </ShopkeeperLayout>
  );
}

export default ShopSettings;