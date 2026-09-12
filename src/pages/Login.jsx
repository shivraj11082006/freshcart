import {
  useEffect,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaSpinner,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../App.css";

import {
  forgotPassword,
  loginUser,
  resendOtp,
  resendResetOtp,
  resetPassword,
  saveAuthData,
  verifyLoginOtp,
} from "../api/api";

function Login() {
  const navigate =
    useNavigate();

  const [
    mode,
    setMode,
  ] = useState("login");

  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
  });

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(0);

  /* =====================================================
     COOLDOWN
  ===================================================== */

 useEffect(() => {
  if (resendCooldown <= 0) {
    return undefined;
  }

  const timer =
    window.setInterval(() => {
      setResendCooldown(
        (value) =>
          Math.max(
            0,
            value - 1
          )
      );
    }, 1000);

  return () =>
    window.clearInterval(
      timer
    );
}, [resendCooldown]);
  /* =====================================================
     INPUT
  ===================================================== */

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

      setError("");
      setSuccess("");
    };

  /* =====================================================
     REDIRECT
  ===================================================== */

  const redirectUser =
    (user) => {
      const role =
        String(
          user?.role ||
            ""
        ).toLowerCase();

      window.setTimeout(
        () => {
          if (
            role ===
            "shopkeeper"
          ) {
            navigate(
              "/shopkeeper-dashboard",
              {
                replace:
                  true,
              }
            );
          } else {
            navigate(
              "/",
              {
                replace:
                  true,
              }
            );
          }
        },
        400
      );
    };

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      if (
        !email ||
        !password
      ) {
        setError(
          "Email and password are required."
        );

        return;
      }

      try {
        setLoading(true);

        const data =
          await loginUser({
            email,
            password,
          });

        if (
          data?.token &&
          data?.user
        ) {
          saveAuthData(
            data.token,
            data.user
          );

          setSuccess(
            "Login successful!"
          );

          redirectUser(
            data.user
          );

          return;
        }
      } catch (
        error
      ) {
        if (
          error.status ===
            403 &&
          error.response
            ?.requiresVerification
        ) {
          setMode(
            "verify"
          );

          setResendCooldown(
            Number(
              error.response
                ?.resendAfterSeconds ||
                60
            )
          );

          setSuccess(
            "OTP sent to your email. Please check your inbox."
          );

          return;
        }

        setError(
          error.message ||
            "Login failed."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     VERIFY LOGIN OTP
  ===================================================== */

  const handleVerify =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !/^\d{6}$/.test(
          otp
        )
      ) {
        setError(
          "Enter the 6-digit OTP."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await verifyLoginOtp({
            email:
              formData.email
                .trim()
                .toLowerCase(),

            password:
              formData.password,

            otp,
          });

        if (
          !data?.token ||
          !data?.user
        ) {
          throw new Error(
            "Verification failed."
          );
        }

        saveAuthData(
          data.token,
          data.user
        );

        setSuccess(
          "Account verified successfully!"
        );

        redirectUser(
          data.user
        );
      } catch (
        error
      ) {
        setError(
          error.message ||
            "Invalid OTP."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     RESEND LOGIN OTP
  ===================================================== */

  const handleResend =
    async () => {
      if (
        resendCooldown >
        0
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await resendOtp(
            formData.email
              .trim()
              .toLowerCase()
          );

        setResendCooldown(
          Number(
            data?.resendAfterSeconds ||
              60
          )
        );

        setSuccess(
          "New OTP sent to your email. Please check your inbox."
        );
      } catch (
        error
      ) {
        setError(
          error.message ||
            "Unable to resend OTP."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  const handleForgot =
    async (
      event
    ) => {
      event.preventDefault();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      if (!email) {
        setError(
          "Enter your email address first."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await forgotPassword(
            email
          );

        setMode(
          "reset"
        );

        setResendCooldown(
          Number(
            data?.resendAfterSeconds ||
              60
          )
        );

        setSuccess(
          "Password reset OTP sent to your email. Please check your inbox."
        );
      } catch (
        error
      ) {
        setError(
          error.message ||
            "Unable to start password reset."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handleReset =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !/^\d{6}$/.test(
          otp
        )
      ) {
        setError(
          "Enter the 6-digit reset OTP."
        );

        return;
      }

      if (
        newPassword.length <
        6
      ) {
        setError(
          "New password must contain at least 6 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        await resetPassword({
          email:
            formData.email
              .trim()
              .toLowerCase(),

          otp,

          newPassword,
        });

        setMode(
          "login"
        );

        setOtp("");
        setNewPassword("");
        setConfirmPassword("");

        setSuccess(
          "Password reset successfully. You can now login with your new password."
        );
      } catch (
        error
      ) {
        setError(
          error.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     RESEND RESET OTP
  ===================================================== */

  const handleResendReset =
    async () => {
      if (
        resendCooldown >
        0
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await resendResetOtp(
            formData.email
              .trim()
              .toLowerCase()
          );

        setResendCooldown(
          Number(
            data?.resendAfterSeconds ||
              60
          )
        );

        setSuccess(
          "New reset OTP sent to your email. Please check your inbox."
        );
      } catch (
        error
      ) {
        setError(
          error.message ||
            "Unable to resend reset OTP."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="auth-page">
      <Link
        to="/"
        className="auth-back"
      >
        <FaArrowLeft />
        Back to Home
      </Link>

      <div className="auth-card">
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

        {/* =================================================
            LOGIN
        ================================================= */}

        {mode ===
          "login" && (
          <>
            <div className="auth-header">
              <span className="auth-welcome-badge">
                WELCOME BACK
              </span>

              <h1>
                Login to FreshCart
              </h1>

              <p>
                Fresh groceries are
                just a few clicks away.
              </p>
            </div>

            {success && (
              <div className="auth-success">
                <FaCheckCircle />
                {success}
              </div>
            )}

            {error && (
              <div className="auth-error">
                <FaExclamationCircle />
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleLogin
              }
              className="auth-form"
            >
              <div className="form-group">
                <label>
                  Email
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
                    required
                  />
                </div>
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (
                          value
                        ) =>
                          !value
                      )
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

              <div
                style={{
                  textAlign:
                    "right",
                  marginBottom:
                    "12px",
                }}
              >
                <button
                  type="button"
                  style={{
                    border:
                      "none",
                    background:
                      "none",
                    padding: 0,
                    cursor:
                      "pointer",
                    color:
                      "#16a34a",
                    fontWeight:
                      600,
                  }}
                  onClick={() =>
                    setMode(
                      "forgot"
                    )
                  }
                >
                  Forgot Password?
                </button>
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
                    Checking...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create Account
              </Link>
            </div>
          </>
        )}

        {/* =================================================
            VERIFY OTP
        ================================================= */}

        {mode ===
          "verify" && (
          <>
            <div className="auth-header">
              <span className="auth-welcome-badge">
                VERIFY ACCOUNT
              </span>

              <h1>
                Enter OTP
              </h1>

              <p>
                Enter the 6-digit code
                sent to:
              </p>

              <strong>
                {
                  formData.email
                }
              </strong>
            </div>

            {success && (
              <div className="auth-success">
                <FaCheckCircle />
                {success}
              </div>
            )}

            {error && (
              <div className="auth-error">
                <FaExclamationCircle />
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleVerify
              }
              className="auth-form"
            >
              <div className="form-group">
                <label>
                  Verification OTP
                </label>

                <div className="input-wrapper">
                  <FaKey />

                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(
                      event
                    ) =>
                      setOtp(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            6
                          )
                      )
                    }
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="6-digit OTP"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={
                  loading ||
                  otp.length !==
                    6
                }
              >
                {loading ? (
                  <FaSpinner className="fa-spin" />
                ) : (
                  "Verify & Login"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <button
                type="button"
                disabled={
                  loading ||
                  resendCooldown >
                    0
                }
                onClick={
                  handleResend
                }
              >
                {resendCooldown >
                0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode(
                    "login"
                  )
                }
              >
                Back
              </button>
            </div>
          </>
        )}

        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        {mode ===
          "forgot" && (
          <>
            <div className="auth-header">
              <span className="auth-welcome-badge">
                ACCOUNT RECOVERY
              </span>

              <h1>
                Forgot Password?
              </h1>

              <p>
                Enter your FreshCart
                email and we'll send
                you a reset OTP.
              </p>
            </div>

            {success && (
              <div className="auth-success">
                <FaCheckCircle />
                {success}
              </div>
            )}

            {error && (
              <div className="auth-error">
                <FaExclamationCircle />
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleForgot
              }
              className="auth-form"
            >
              <div className="form-group">
                <label>
                  Email
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
                    required
                  />
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
                  <FaSpinner className="fa-spin" />
                ) : (
                  "Send Reset OTP"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <button
                type="button"
                onClick={() =>
                  setMode(
                    "login"
                  )
                }
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}

        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        {mode ===
          "reset" && (
          <>
            <div className="auth-header">
              <span className="auth-welcome-badge">
                RESET PASSWORD
              </span>

              <h1>
                Create New Password
              </h1>

              <p>
                Enter the OTP and your
                new password.
              </p>
            </div>

            {success && (
              <div className="auth-success">
                <FaCheckCircle />
                {success}
              </div>
            )}

            {error && (
              <div className="auth-error">
                <FaExclamationCircle />
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleReset
              }
              className="auth-form"
            >
              <div className="form-group">
                <label>
                  Reset OTP
                </label>

                <div className="input-wrapper">
                  <FaKey />

                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(
                      event
                    ) =>
                      setOtp(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            6
                          )
                      )
                    }
                    maxLength={6}
                    placeholder="6-digit OTP"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  New Password
                </label>

                <div className="input-wrapper">
                  <FaLock />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      newPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setNewPassword(
                        event.target
                          .value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="New password"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Confirm Password
                </label>

                <div className="input-wrapper">
                  <FaLock />

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    required
                  />
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
                  <FaSpinner className="fa-spin" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <button
                type="button"
                disabled={
                  loading ||
                  resendCooldown >
                    0
                }
                onClick={
                  handleResendReset
                }
              >
                {resendCooldown >
                0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Reset OTP"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode(
                    "login"
                  )
                }
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
