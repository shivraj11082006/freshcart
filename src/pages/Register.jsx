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
    password: "",
    role: "customer",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    isSuccess,
    setIsSuccess,
  ] = useState(false);

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } =
        event.target;

      setFormData(
        (current) => ({
          ...current,
          [name]:
            value,
        })
      );

      setMessage("");
      setIsSuccess(false);
    };

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setMessage("");
      setIsSuccess(false);

      const name =
        formData.name.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

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
        name.length < 2
      ) {
        setMessage(
          "Name must contain at least 2 characters."
        );

        return;
      }

      if (
        name.length > 80
      ) {
        setMessage(
          "Name must be less than 80 characters."
        );

        return;
      }

      if (
        password.length < 6
      ) {
        setMessage(
          "Password must contain at least 6 characters."
        );

        return;
      }

      if (
        password.length > 128
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
        setLoading(true);

        const data =
          await registerUser({
            name,
            email,
            password,
            role,
          });

        setIsSuccess(
          true
        );

        if (
          data?.devOtp
        ) {
          setMessage(
            `Account created! Development OTP: ${data.devOtp}. Continue to login and verify your email.`
          );
        } else if (
          data?.otpSent
        ) {
          setMessage(
            `Account created! We sent a verification OTP to ${email}. Continue to login and verify your email.`
          );
        } else {
          setMessage(
            `Account created successfully. Please login with ${email} to request your verification OTP.`
          );
        }

        /*
          Give the user enough time to
          read the message.
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

        setIsSuccess(
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
      <div className="auth-background-decoration auth-decoration-one" />

      <div className="auth-background-decoration auth-decoration-two" />

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
              isSuccess
                ? "auth-success"
                : "auth-error"
            }
          >
            {isSuccess ? (
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
          {/* NAME */}

          <div className="form-group">
            <label htmlFor="register-name">
              Full Name
            </label>

            <div className="input-wrapper">
              <FaUser />

              <input
                id="register-name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                autoComplete="name"
                maxLength={80}
                disabled={
                  loading
                }
                required
              />
            </div>
          </div>

          {/* EMAIL */}

          <div className="form-group">
            <label htmlFor="register-email">
              Email Address
            </label>

            <div className="input-wrapper">
              <FaEnvelope />

              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                autoComplete="email"
                maxLength={160}
                disabled={
                  loading
                }
                required
              />
            </div>

            <small>
              A verification OTP will
              be sent to this email.
            </small>
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <label htmlFor="register-password">
              Password
            </label>

            <div className="input-wrapper">
              <FaLock />

              <input
                id="register-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Create a password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
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
                tabIndex={
                  -1
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>
          </div>

          {/* ROLE */}

          <div className="form-group">
            <label>
              Account Type
            </label>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap:
                  "12px",
              }}
            >
              <label
                style={{
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

                <span
                  style={{
                    marginLeft:
                      "8px",
                  }}
                >
                  <FaShoppingBasket />
                  {" "}
                  Customer
                </span>
              </label>

              <label
                style={{
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

                <span
                  style={{
                    marginLeft:
                      "8px",
                  }}
                >
                  <FaStore />
                  {" "}
                  Shopkeeper
                </span>
              </label>
            </div>
          </div>

          {/* SUBMIT */}

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

          <Link to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;