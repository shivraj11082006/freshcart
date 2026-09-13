import {
  useState,
} from "react";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPhone,
  FaShoppingBasket,
  FaSpinner,
  FaStore,
  FaUser,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../App.css";

import {
  registerUser,
} from "../api/api";

function Register() {
  const navigate =
    useNavigate();

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(
    false
  );

  const [
    message,
    setMessage,
  ] = useState(
    ""
  );

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const [
    success,
    setSuccess,
  ] = useState(
    false
  );

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } =
        event.target;

      setFormData(
        (
          current
        ) => ({
          ...current,

          [name]:
            value,
        })
      );

      setMessage("");
      setSuccess(
        false
      );
    };

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setMessage("");
      setSuccess(
        false
      );

      const name =
        formData.name.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const phone =
        formData.phone
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            10
          );

      const password =
        formData.password;

      const role =
        formData.role;

      if (
        !name ||
        !email ||
        !password
      ) {
        setMessage(
          "Name, email and password are required."
        );

        return;
      }

      if (
        name.length <
        2
      ) {
        setMessage(
          "Name must contain at least 2 characters."
        );

        return;
      }

      if (
        name.length >
        80
      ) {
        setMessage(
          "Name is too long."
        );

        return;
      }

      if (
        phone &&
        !/^[6-9]\d{9}$/.test(
          phone
        )
      ) {
        setMessage(
          "Please enter a valid 10-digit Indian mobile number."
        );

        return;
      }

      if (
        password.length <
        6
      ) {
        setMessage(
          "Password must contain at least 6 characters."
        );

        return;
      }

      if (
        password.length >
        128
      ) {
        setMessage(
          "Password is too long."
        );

        return;
      }

      if (
        ![
          "customer",
          "shopkeeper",
          "delivery_partner",
        ].includes(
          role
        )
      ) {
        setMessage(
          "Please select a valid account type."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        const data =
          await registerUser({
            name,

            email,

            phone,

            password,

            role,
          });

        setSuccess(
          true
        );

        setMessage(
          data?.message ||
            "Account created successfully. Check your email for the OTP."
        );

        /*
          Send the user to Login.

          Login will request an OTP
          again, so the same login
          verification flow is used.
        */

        window.setTimeout(
          () => {
            navigate(
              "/login",
              {
                replace:
                  true,

                state: {
                  email,
                },
              }
            );
          },
          1800
        );
      } catch (
        error
      ) {
        console.error(
          "Registration Error:",
          error
        );

        setSuccess(
          false
        );

        setMessage(
          error.message ||
            "Registration failed. Please try again."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  return (
    <div className="auth-page">

      <Link
        to="/"
        className="auth-back"
      >
        <FaArrowLeft />

        Back to Home
      </Link>

      <div className="auth-card register-auth-card">

        <Link
          to="/"
          className="auth-logo"
        >
          <span>
            🌱
          </span>

          Fresh
          <strong>
            Cart
          </strong>
        </Link>

        <div className="auth-header">

          <span className="auth-welcome-badge">
            JOIN FRESHCART
          </span>

          <h1>
            Create your account
          </h1>

          <p>
            Start shopping or selling
            fresh products today.
          </p>

        </div>

        {message && (
          <div
            className={
              success
                ? "auth-success"
                : "auth-error"
            }
          >

            {success ? (
              <FaCheckCircle />
            ) : (
              <FaExclamationCircle />
            )}

            <span>
              {message}
            </span>

          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="auth-form"
        >

          <div className="form-group">

            <label>
              Full Name
            </label>

            <div className="input-wrapper">

              <FaUser />

              <input
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={80}
                disabled={
                  loading
                }
                required
              />

            </div>

          </div>

          <div className="form-group">

            <label>
              Email Address
            </label>

            <div className="input-wrapper">

              <FaEnvelope />

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your email"
                autoComplete="email"
                maxLength={160}
                disabled={
                  loading
                }
                required
              />

            </div>

            <small>
              Your login OTP will be
              sent to this email.
            </small>

          </div>

          <div className="form-group">

            <label>
              Mobile Number
              {" "}
              <span
                style={{
                  color:
                    "#94a3b8",
                }}
              >
                (optional)
              </span>
            </label>

            <div className="input-wrapper">

              <FaPhone />

              <input
                type="tel"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                placeholder="10-digit mobile number"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                disabled={
                  loading
                }
              />

            </div>

            <small>
              You can add your phone
              number for future delivery
              features.
            </small>

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <div className="input-wrapper">

              <FaLock />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                placeholder="Create a password"
                autoComplete="new-password"
                maxLength={128}
                disabled={
                  loading
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>

          <div className="form-group">

            <label>
              Account Type
            </label>

            <div
              style={{
                display:
                  "grid",

                gap:
                  "12px",
              }}
            >

              <label
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "8px",

                  cursor:
                    "pointer",
                }}
              >

                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={
                    formData.role ===
                    "customer"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                />

                <FaShoppingBasket />

                Customer

              </label>

              <label
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "8px",

                  cursor:
                    "pointer",
                }}
              >

                <input
                  type="radio"
                  name="role"
                  value="shopkeeper"
                  checked={
                    formData.role ===
                    "shopkeeper"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                />

                <FaStore />

                Shopkeeper

              </label>

              <label
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "8px",

                  cursor:
                    "pointer",
                }}
              >

                <input
                  type="radio"
                  name="role"
                  value="delivery_partner"
                  checked={
                    formData.role ===
                    "delivery_partner"
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                />

                🚚

                Delivery Partner

              </label>

            </div>

          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={
              loading
            }
          >
            {loading ? (
              <>
                <FaSpinner className="fa-spin" />

                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

        </form>

        <div className="auth-footer">

          <span>
            Already have an account?
          </span>

          <Link
            to="/login"
          >
            Login
          </Link>

        </div>

      </div>
    </div>
  );
}

export default Register;