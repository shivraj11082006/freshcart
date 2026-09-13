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
  useLocation,
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

  const location =
    useLocation();

  const [
    mode,
    setMode,
  ] = useState(
    "login"
  );

  const [
    formData,
    setFormData,
  ] = useState({
    email:
      location.state
        ?.email ||
      "",

    password:
      "",
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
  ] = useState(
    false
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
    ""
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(
    0
  );

  /* =====================================================
     COOLDOWN
  ===================================================== */

  useEffect(() => {
    if (
      resendCooldown <=
      0
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          setResendCooldown(
            (
              current
            ) =>
              Math.max(
                0,
                current -
                  1
              )
          );
        },
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    resendCooldown,
  ]);

  /* =====================================================
     REDIRECT
  ===================================================== */

  const redirectUser =
    (user) => {
      const role =
        String(
          user?.role ||
            ""
        )
          .trim()
          .toLowerCase();

      if (
        role ===
        "delivery_partner"
      ) {
        navigate(
          "/delivery-dashboard",
          {
            replace:
              true,
          }
        );

        return;
      }

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

        return;
      }

      navigate(
        "/",
        {
          replace:
            true,
        }
      );
    };

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
        (
          current
        ) => ({
          ...current,

          [name]:
            value,
        })
      );

      setError("");
      setSuccess("");
    };

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin =
    async (
      event
    ) => {
      event.preventDefault();

      setLoading(
        true
      );

      setError("");
      setSuccess("");

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const password =
        formData.password;

      try {
        const data =
          await loginUser({
            email,
            password,
          });

        /*
          Production flow:

          Correct password
              ↓
          Backend sends OTP
              ↓
          Backend returns 403
          requiresVerification=true
        */

        if (
          data?.token &&
          data?.user
        ) {
          saveAuthData(
            data.token,
            data.user
          );

          setSuccess(
            "Login successful."
          );

          redirectUser(
            data.user
          );

          return;
        }

        throw new Error(
          "Unexpected login response."
        );
      } catch (
        apiError
      ) {
        if (
          apiError.status ===
            403 &&
          apiError.response
            ?.requiresVerification
        ) {
          setMode(
            "verify"
          );

          setOtp("");

          setResendCooldown(
            Number(
              apiError.response
                ?.resendAfterSeconds ||
                60
            )
          );

          setSuccess(
            apiError.message ||
              "OTP sent to your email. Please check your inbox."
          );

          return;
        }

        setError(
          apiError.message ||
            "Login failed."
        );
      } finally {
        setLoading(
          false
        );
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
          "Please enter the 6-digit OTP."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        setError("");
        setSuccess("");

        const data =
          await verifyLoginOtp(
            {
              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              password:
                formData.password,

              otp,
            }
          );

        if (
          !data?.token ||
          !data?.user
        ) {
          throw new Error(
            "OTP verification failed."
          );
        }

        saveAuthData(
          data.token,
          data.user
        );

        setSuccess(
          "OTP verified. Login successful."
        );

        redirectUser(
          data.user
        );
      } catch (
        apiError
      ) {
        setError(
          apiError.message ||
            "OTP verification failed."
        );
      } finally {
        setLoading(
          false
        );
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
        setLoading(
          true
        );

        setError("");
        setSuccess("");

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
          data?.message ||
            "A new OTP has been sent to your email."
        );
      } catch (
        apiError
      ) {
        setError(
          apiError.message ||
            "Unable to resend OTP."
        );
      } finally {
        setLoading(
          false
        );
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
          "Please enter your email address."
        );

        return;
      }

      try {
        setLoading(
          true
        );

        setError("");
        setSuccess("");

        const data =
          await forgotPassword(
            email
          );

        setOtp("");

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
          data?.message ||
            "Password reset OTP sent to your email."
        );
      } catch (
        apiError
      ) {
        setError(
          apiError.message ||
            "Unable to start password reset."
        );
      } finally {
        setLoading(
          false
        );
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
          "Please enter the 6-digit reset OTP."
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
        setLoading(
          true
        );

        setError("");
        setSuccess("");

        await resetPassword({
          email:
            formData.email
              .trim()
              .toLowerCase(),

          otp,

          newPassword,
        });

        setOtp("");

        setNewPassword(
          ""
        );

        setConfirmPassword(
          ""
        );

        setMode(
          "login"
        );

        setSuccess(
          "Password reset successfully. You can now login."
        );
      } catch (
        apiError
      ) {
        setError(
          apiError.message ||
            "Unable to reset password."
        );
      } finally {
        setLoading(
          false
        );
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
        setLoading(
          true
        );

        setError("");
        setSuccess("");

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
          data?.message ||
            "A new reset OTP has been sent to your email."
        );
      } catch (
        apiError
      ) {
        setError(
          apiError.message ||
            "Unable to resend reset OTP."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =====================================================
     MESSAGES
  ===================================================== */

  const Messages =
    () => (
      <>
        {success && (
          <div className="auth-success">
            <FaCheckCircle />

            <span>
              {success}
            </span>
          </div>
        )}

        {error && (
          <div className="auth-error">
            <FaExclamationCircle />

            <span>
              {error}
            </span>
          </div>
        )}
      </>
    );

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
                Enter your credentials.
                We'll send a verification
                OTP to your email.
              </p>

            </div>

            <Messages />

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
                          current
                        ) =>
                          !current
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
                  onClick={() =>
                    setMode(
                      "forgot"
                    )
                  }
                  style={{
                    border:
                      "none",

                    background:
                      "none",

                    padding:
                      0,

                    cursor:
                      "pointer",

                    color:
                      "#16a34a",

                    fontWeight:
                      600,
                  }}
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

                    Sending OTP...
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

              <Link
                to="/register"
              >
                Create Account
              </Link>

            </div>
          </>
        )}

        {/* =================================================
            OTP
        ================================================= */}

        {mode ===
          "verify" && (
          <>
            <div className="auth-header">

              <span className="auth-welcome-badge">
                EMAIL VERIFICATION
              </span>

              <h1>
                Enter your OTP
              </h1>

              <p>
                We sent a 6-digit
                verification code to
                <strong>
                  {" "}
                  {formData.email}
                </strong>
              </p>

            </div>

            <Messages />

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
                    placeholder="Enter 6-digit OTP"
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

            <div
              className="auth-footer"
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                gap:
                  "10px",
              }}
            >

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
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#16a34a",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",
                }}
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
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#64748b",

                  cursor:
                    "pointer",
                }}
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
                Enter your email and
                we'll send you a reset
                OTP.
              </p>

            </div>

            <Messages />

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
                    value={
                      formData.email
                    }
                    onChange={(
                      event
                    ) =>
                      setFormData(
                        (
                          current
                        ) => ({
                          ...current,

                          email:
                            event
                              .target
                              .value,
                        })
                      )
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
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#16a34a",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",
                }}
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
                Enter the reset OTP
                sent to your email.
              </p>

            </div>

            <Messages />

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
                    placeholder="Confirm password"
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

            <div
              className="auth-footer"
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                gap:
                  "10px",
              }}
            >

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
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#16a34a",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",
                }}
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
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  color:
                    "#64748b",

                  cursor:
                    "pointer",
                }}
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