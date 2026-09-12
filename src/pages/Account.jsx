import {
  useEffect,
  useState,
} from "react";

import {
  FaUser,
  FaEnvelope,
  FaShoppingBag,
  FaSignOutAlt,
  FaLeaf,
  FaChevronRight,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaSpinner,
  FaLock,
  FaBell,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getUser,
  clearAuthData,
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../api/api";

import "../App.css";

function Account() {
  const navigate =
    useNavigate();

  /* =====================================================
     USER
  ===================================================== */

  const [user, setUser] =
    useState(() =>
      getUser()
    );

  /* =====================================================
     PROFILE
  ===================================================== */

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  const [
    profileSaving,
    setProfileSaving,
  ] = useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const [
    profileForm,
    setProfileForm,
  ] = useState({
    name: "",
    email: "",
  });

  /* =====================================================
     PASSWORD
  ===================================================== */

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* =====================================================
     ADDRESS
  ===================================================== */

  const [
    addresses,
    setAddresses,
  ] = useState([]);

  const [
    addressLoading,
    setAddressLoading,
  ] = useState(true);

  const [
    addressSaving,
    setAddressSaving,
  ] = useState(false);

  const [
    addressMessage,
    setAddressMessage,
  ] = useState("");

  const [
    showAddressForm,
    setShowAddressForm,
  ] = useState(false);

  const [
    editingAddressId,
    setEditingAddressId,
  ] = useState(null);

  const [
    addressForm,
    setAddressForm,
  ] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    addressType: "home",
    isDefault: false,
  });

  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const loadProfile =
      async () => {
        try {
          setProfileLoading(
            true
          );

          setProfileError("");

          const data =
            await getProfile();

          if (data?.user) {
            setUser(
              data.user
            );

            setProfileForm({
              name:
                data.user.name ||
                "",

              email:
                data.user.email ||
                "",
            });

            localStorage.setItem(
              "user",
              JSON.stringify(
                data.user
              )
            );
          }
        } catch (error) {
          setProfileError(
            error.message ||
              "Unable to load profile."
          );
        } finally {
          setProfileLoading(
            false
          );
        }
      };

    loadProfile();
  }, [navigate]);

  /* =====================================================
     LOAD ADDRESSES
  ===================================================== */

  const loadAddresses =
    async () => {
      try {
        setAddressLoading(
          true
        );

        const data =
          await getAddresses();

        setAddresses(
          Array.isArray(
            data?.addresses
          )
            ? data.addresses
            : []
        );
      } catch (error) {
        setAddressMessage(
          error.message ||
            "Unable to load addresses."
        );
      } finally {
        setAddressLoading(
          false
        );
      }
    };

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  /* =====================================================
     PROFILE INPUT
  ===================================================== */

  const handleProfileChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setProfileForm(
        (current) => ({
          ...current,

          [name]: value,
        })
      );
    };

  /* =====================================================
     PROFILE SUBMIT
  ===================================================== */

  const handleProfileSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setProfileSaving(
          true
        );

        setProfileMessage("");
        setProfileError("");

        const name =
          profileForm.name.trim();

        if (
          name.length < 2 ||
          name.length > 80
        ) {
          throw new Error(
            "Name must contain 2 to 80 characters."
          );
        }

        const data =
          await updateProfile({
            name,
            email:
              profileForm.email.trim(),
          });

        if (data?.user) {
          setUser(
            data.user
          );

          setProfileForm({
            name:
              data.user.name ||
              "",

            email:
              data.user.email ||
              "",
          });

          localStorage.setItem(
            "user",
            JSON.stringify(
              data.user
            )
          );
        }

        setProfileMessage(
          "Profile updated successfully."
        );
      } catch (error) {
        setProfileError(
          error.message ||
            "Unable to update profile."
        );
      } finally {
        setProfileSaving(
          false
        );
      }
    };

  /* =====================================================
     PASSWORD INPUT
  ===================================================== */

  const handlePasswordChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setPasswordForm(
        (current) => ({
          ...current,

          [name]: value,
        })
      );
    };

  /* =====================================================
     PASSWORD SUBMIT
  ===================================================== */

  const handlePasswordSubmit =
    async (event) => {
      event.preventDefault();

      setPasswordMessage("");
      setPasswordError("");

      if (
        passwordForm.newPassword
          .length < 6
      ) {
        setPasswordError(
          "New password must contain at least 6 characters."
        );

        return;
      }

      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setPasswordError(
          "New password and confirmation do not match."
        );

        return;
      }

      try {
        setPasswordSaving(
          true
        );

        await changePassword({
          currentPassword:
            passwordForm.currentPassword,

          newPassword:
            passwordForm.newPassword,
        });

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setPasswordMessage(
          "Password changed successfully."
        );
      } catch (error) {
        setPasswordError(
          error.message ||
            "Unable to change password."
        );
      } finally {
        setPasswordSaving(
          false
        );
      }
    };

  /* =====================================================
     RESET ADDRESS FORM
  ===================================================== */

  const resetAddressForm =
    () => {
      setAddressForm({
        fullName:
          user?.name || "",

        phone: "",

        addressLine: "",

        city: "",

        state: "",

        pincode: "",

        landmark: "",

        addressType:
          "home",

        isDefault:
          addresses.length === 0,
      });

      setEditingAddressId(
        null
      );

      setShowAddressForm(
        false
      );
    };

  /* =====================================================
     ADDRESS INPUT
  ===================================================== */

  const handleAddressChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setAddressForm(
        (current) => ({
          ...current,

          [name]:
            type ===
            "checkbox"
              ? checked
              : value,
        })
      );
    };

  /* =====================================================
     ADD
  ===================================================== */

  const handleAddAddress =
    () => {
      setAddressMessage("");

      setAddressForm({
        fullName:
          user?.name || "",

        phone: "",

        addressLine: "",

        city: "",

        state: "",

        pincode: "",

        landmark: "",

        addressType:
          "home",

        isDefault:
          addresses.length === 0,
      });

      setEditingAddressId(
        null
      );

      setShowAddressForm(
        true
      );
    };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEditAddress =
    (address) => {
      setAddressMessage("");

      setAddressForm({
        fullName:
          address.fullName ||
          "",

        phone:
          address.phone ||
          "",

        addressLine:
          address.addressLine ||
          "",

        city:
          address.city ||
          "",

        state:
          address.state ||
          "",

        pincode:
          address.pincode ||
          "",

        landmark:
          address.landmark ||
          "",

        addressType:
          address.addressType ||
          "home",

        isDefault:
          Boolean(
            address.isDefault
          ),
      });

      setEditingAddressId(
        address._id
      );

      setShowAddressForm(
        true
      );
    };

  /* =====================================================
     SAVE ADDRESS
  ===================================================== */

  const handleAddressSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !/^[0-9]{10}$/.test(
          addressForm.phone.trim()
        )
      ) {
        setAddressMessage(
          "Enter a valid 10-digit phone number."
        );

        return;
      }

      if (
        !/^[0-9]{6}$/.test(
          addressForm.pincode.trim()
        )
      ) {
        setAddressMessage(
          "Enter a valid 6-digit pincode."
        );

        return;
      }

      try {
        setAddressSaving(
          true
        );

        setAddressMessage("");

        const payload = {
          ...addressForm,

          fullName:
            addressForm.fullName.trim(),

          phone:
            addressForm.phone.trim(),

          addressLine:
            addressForm.addressLine.trim(),

          city:
            addressForm.city.trim(),

          state:
            addressForm.state.trim(),

          pincode:
            addressForm.pincode.trim(),

          landmark:
            addressForm.landmark.trim(),
        };

        if (
          editingAddressId
        ) {
          await updateAddress(
            editingAddressId,
            payload
          );
        } else {
          await createAddress(
            payload
          );
        }

        await loadAddresses();

        setAddressMessage(
          editingAddressId
            ? "Address updated successfully."
            : "Address added successfully."
        );

        resetAddressForm();
      } catch (error) {
        setAddressMessage(
          error.message ||
            "Unable to save address."
        );
      } finally {
        setAddressSaving(
          false
        );
      }
    };

  /* =====================================================
     DEFAULT ADDRESS
  ===================================================== */

  const handleSetDefault =
    async (id) => {
      try {
        setAddressMessage("");

        await setDefaultAddress(
          id
        );

        await loadAddresses();

        setAddressMessage(
          "Default address updated."
        );
      } catch (error) {
        setAddressMessage(
          error.message ||
            "Unable to update default address."
        );
      }
    };

  /* =====================================================
     DELETE ADDRESS
  ===================================================== */

  const handleDeleteAddress =
    async (id) => {
      if (
        !window.confirm(
          "Delete this address?"
        )
      ) {
        return;
      }

      try {
        setAddressMessage("");

        await deleteAddress(
          id
        );

        await loadAddresses();

        setAddressMessage(
          "Address deleted successfully."
        );
      } catch (error) {
        setAddressMessage(
          error.message ||
            "Unable to delete address."
        );
      }
    };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    () => {
      clearAuthData();

      navigate("/", {
        replace: true,
      });

      window.location.reload();
    };

  /* =====================================================
     ROLE
  ===================================================== */

  const isShopkeeper =
    String(
      user?.role || ""
    ).toLowerCase() ===
    "shopkeeper";

  const roleLabel =
    isShopkeeper
      ? "Shopkeeper"
      : "Customer";

  /* =====================================================
     NO USER
  ===================================================== */

  if (!user) {
    return null;
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="professional-account-page">
      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="simple-market-header">
        <div className="simple-market-inner">
          <Link
            to="/"
            className="professional-logo"
          >
            🌿 Fresh
            <span>
              Cart
            </span>
          </Link>

          <div className="simple-header-title">
            My Account
          </div>

          <Link
            to="/shop"
            className="simple-header-link"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="professional-account-container">
        {/* ========================================
            WELCOME
        ======================================== */}

        <div className="account-welcome">
          <div className="account-avatar-large">
            <FaUser />
          </div>

          <div>
            <span>
              Welcome back
            </span>

            <h1>
              {user.name}
            </h1>

            <p>
              Manage your FreshCart
              account and orders.
            </p>
          </div>
        </div>

        {/* ========================================
            MAIN GRID
        ======================================== */}

        <div className="professional-account-grid">
          {/* ======================================
              PROFILE
          ====================================== */}

          <section className="account-profile-card">
            <div className="account-card-heading">
              <div>
                <span>
                  PROFILE
                </span>

                <h2>
                  Personal Information
                </h2>
              </div>

              <FaUser />
            </div>

            {profileLoading ? (
              <div className="account-loading">
                <FaSpinner className="spinner" />

                Loading profile...
              </div>
            ) : (
              <form
                onSubmit={
                  handleProfileSubmit
                }
                className="account-profile-form"
              >
                <div className="account-form-group">
                  <label>
                    <FaUser />

                    Full Name
                  </label>

                  <input
                    name="name"
                    value={
                      profileForm.name
                    }
                    onChange={
                      handleProfileChange
                    }
                    required
                    maxLength={80}
                  />
                </div>

                <div className="account-form-group">
                  <label>
                    <FaEnvelope />

                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      profileForm.email
                    }
                    readOnly
                    disabled
                  />

                  <small>
                    Email changes require
                    verification.
                  </small>
                </div>

                <div className="account-form-group">
                  <label>
                    <FaShieldAlt />

                    Account Type
                  </label>

                  <input
                    value={
                      roleLabel
                    }
                    disabled
                    readOnly
                  />
                </div>

                <button
                  type="submit"
                  className="professional-primary-btn"
                  disabled={
                    profileSaving
                  }
                >
                  {profileSaving ? (
                    <>
                      <FaSpinner className="spinner" />

                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </button>

                {profileMessage && (
                  <p className="account-success-message">
                    <FaCheckCircle />

                    {profileMessage}
                  </p>
                )}

                {profileError && (
                  <p className="checkout-error">
                    {profileError}
                  </p>
                )}
              </form>
            )}
          </section>

          {/* ======================================
              QUICK ACCESS
          ====================================== */}

          <section className="account-actions-card">
            <div className="account-card-heading">
              <div>
                <span>
                  QUICK ACCESS
                </span>

                <h2>
                  My Account
                </h2>
              </div>
            </div>

            <Link
              to="/orders"
              className="account-action-item"
            >
              <div className="account-action-icon">
                <FaShoppingBag />
              </div>

              <div>
                <strong>
                  My Orders
                </strong>

                <span>
                  View your order history
                </span>
              </div>

              <FaChevronRight />
            </Link>

            <Link
              to="/notifications"
              className="account-action-item"
            >
              <div className="account-action-icon">
                <FaBell />
              </div>

              <div>
                <strong>
                  Notifications
                </strong>

                <span>
                  View order and payment updates
                </span>
              </div>

              <FaChevronRight />
            </Link>

            <Link
              to="/shop"
              className="account-action-item"
            >
              <div className="account-action-icon">
                <FaLeaf />
              </div>

              <div>
                <strong>
                  Shop Products
                </strong>

                <span>
                  Browse fresh groceries
                </span>
              </div>

              <FaChevronRight />
            </Link>

            {isShopkeeper && (
              <Link
                to="/shopkeeper-dashboard"
                className="account-action-item"
              >
                <div className="account-action-icon">
                  📊
                </div>

                <div>
                  <strong>
                    Shopkeeper Dashboard
                  </strong>

                  <span>
                    Manage your shop
                  </span>
                </div>

                <FaChevronRight />
              </Link>
            )}

            <button
              type="button"
              className="account-action-item account-logout-action"
              onClick={
                handleLogout
              }
            >
              <div className="account-action-icon">
                <FaSignOutAlt />
              </div>

              <div>
                <strong>
                  Logout
                </strong>

                <span>
                  Sign out of your account
                </span>
              </div>

              <FaChevronRight />
            </button>
          </section>
        </div>

        {/* ========================================
            SECURITY
        ======================================== */}

        <section className="account-security-section">
          <div className="account-card-heading">
            <div>
              <span>
                SECURITY
              </span>

              <h2>
                Change Password
              </h2>
            </div>

            <FaLock />
          </div>

          <form
            className="account-password-form"
            onSubmit={
              handlePasswordSubmit
            }
          >
            <div className="account-form-group">
              <label>
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={
                  passwordForm.currentPassword
                }
                onChange={
                  handlePasswordChange
                }
                autoComplete="current-password"
                required
              />
            </div>

            <div className="account-form-group">
              <label>
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                value={
                  passwordForm.newPassword
                }
                onChange={
                  handlePasswordChange
                }
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
              />
            </div>

            <div className="account-form-group">
              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwordForm.confirmPassword
                }
                onChange={
                  handlePasswordChange
                }
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                required
              />
            </div>

            <button
              type="submit"
              className="professional-primary-btn"
              disabled={
                passwordSaving
              }
            >
              {passwordSaving ? (
                <>
                  <FaSpinner className="spinner" />

                  Updating...
                </>
              ) : (
                <>
                  <FaLock />

                  Change Password
                </>
              )}
            </button>

            {passwordMessage && (
              <p className="account-success-message">
                <FaCheckCircle />

                {passwordMessage}
              </p>
            )}

            {passwordError && (
              <p className="checkout-error">
                {passwordError}
              </p>
            )}
          </form>
        </section>

        {/* ========================================
            ADDRESSES
        ======================================== */}

        <section className="account-address-section">
          <div className="account-card-heading">
            <div>
              <span>
                DELIVERY
              </span>

              <h2>
                Saved Addresses
              </h2>
            </div>

            <FaMapMarkerAlt />
          </div>

          {addressMessage && (
            <p className="account-success-message">
              <FaCheckCircle />

              {addressMessage}
            </p>
          )}

          {addressLoading ? (
            <div className="account-loading">
              <FaSpinner className="spinner" />

              Loading addresses...
            </div>
          ) : (
            <div className="account-address-grid">
              {addresses.map(
                (
                  address
                ) => (
                  <article
                    className={`account-address-card ${
                      address.isDefault
                        ? "default"
                        : ""
                    }`}
                    key={
                      address._id
                    }
                  >
                    <div>
                      <span className="account-address-type">
                        {
                          address.addressType
                        }
                      </span>

                      {address.isDefault && (
                        <span className="account-default-badge">
                          Default
                        </span>
                      )}
                    </div>

                    <h3>
                      {
                        address.fullName
                      }
                    </h3>

                    <p>
                      {
                        address.addressLine
                      }

                      {address.landmark
                        ? `, ${address.landmark}`
                        : ""}

                      {`, ${address.city}, ${address.state} - ${address.pincode}`}
                    </p>

                    <small>
                      Phone:{" "}
                      {
                        address.phone
                      }
                    </small>

                    <div className="account-address-actions">
                      <button
                        type="button"
                        className="professional-outline-btn"
                        onClick={() =>
                          handleEditAddress(
                            address
                          )
                        }
                      >
                        <FaEdit />

                        Edit
                      </button>

                      {!address.isDefault && (
                        <button
                          type="button"
                          className="professional-outline-btn"
                          onClick={() =>
                            handleSetDefault(
                              address._id
                            )
                          }
                        >
                          Make Default
                        </button>
                      )}

                      <button
                        type="button"
                        className="account-delete-btn"
                        onClick={() =>
                          handleDeleteAddress(
                            address._id
                          )
                        }
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </article>
                )
              )}

              <button
                type="button"
                className="account-add-address-card"
                onClick={
                  handleAddAddress
                }
              >
                <FaPlus />

                <strong>
                  Add Address
                </strong>

                <span>
                  Save a new delivery address
                </span>
              </button>
            </div>
          )}

          {/* ======================================
              ADDRESS FORM
          ====================================== */}

          {showAddressForm && (
            <form
              className="account-address-form"
              onSubmit={
                handleAddressSubmit
              }
            >
              <div className="account-form-grid">
                <input
                  name="fullName"
                  placeholder="Full name"
                  value={
                    addressForm.fullName
                  }
                  onChange={
                    handleAddressChange
                  }
                  required
                />

                <input
                  name="phone"
                  placeholder="10-digit phone"
                  inputMode="numeric"
                  maxLength={10}
                  value={
                    addressForm.phone
                  }
                  onChange={
                    handleAddressChange
                  }
                  required
                />

                <input
                  name="addressLine"
                  placeholder="House / street / area"
                  value={
                    addressForm.addressLine
                  }
                  onChange={
                    handleAddressChange
                  }
                  required
                />

                <input
                  name="landmark"
                  placeholder="Landmark"
                  value={
                    addressForm.landmark
                  }
                  onChange={
                    handleAddressChange
                  }
                />

                <input
                  name="city"
                  placeholder="City"
                  value={
                    addressForm.city
                  }
                  onChange={
                    handleAddressChange
                  }
                  required
                />

                <input
                  name="state"
                  placeholder="State"
                  value={
                    addressForm.state
                  }
                  onChange={
                    handleAddressChange
                  }
                  required
                />

                <input
                  name="pincode"
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    addressForm.pincode
                  }
                  onChange={
                    handleAddressChange
                  }
                  required
                />

                <select
                  name="addressType"
                  value={
                    addressForm.addressType
                  }
                  onChange={
                    handleAddressChange
                  }
                >
                  <option value="home">
                    Home
                  </option>

                  <option value="work">
                    Work
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={
                    addressForm.isDefault
                  }
                  onChange={
                    handleAddressChange
                  }
                />

                Make this my default
                address
              </label>

              <div className="account-address-form-actions">
                <button
                  type="submit"
                  className="professional-primary-btn"
                  disabled={
                    addressSaving
                  }
                >
                  {addressSaving ? (
                    <>
                      <FaSpinner className="spinner" />

                      Saving...
                    </>
                  ) : editingAddressId ? (
                    "Update Address"
                  ) : (
                    "Save Address"
                  )}
                </button>

                <button
                  type="button"
                  className="professional-outline-btn"
                  onClick={
                    resetAddressForm
                  }
                  disabled={
                    addressSaving
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default Account;