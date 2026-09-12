import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaPlus,
  FaSpinner,
  FaStore,
  FaTruck,
  FaLocationArrow,
} from "react-icons/fa";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getAddresses,
  createAddress,
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  reportPaymentFailure,
} from "../api/api";

import { useCart } from "../context/CartContext";

import {
  getCurrentBrowserLocation,
} from "../utils/location";

import "../App.css";

function Checkout() {
  const PLATFORM_FEE_PER_SHOP = 10;

  const navigate = useNavigate();

  const {
    cart,
    groupedCart,
    cartSubtotal,
    cartDiscountTotal,
    cartOriginalTotal,
    cartLoading,
    clearCart,
  } = useCart();

  /* =====================================================
     ADDRESS STATE
  ===================================================== */

  const [addresses, setAddresses] = useState([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [addressLoading, setAddressLoading] =
    useState(true);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  /* =====================================================
     ORDER STATE
  ===================================================== */

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [message, setMessage] = useState("");

  /* =====================================================
     ADDRESS FORM
  ===================================================== */

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "home",
    isDefault: false,
    latitude: "",
    longitude: "",
  });

  /* =====================================================
     LOAD ADDRESSES
  ===================================================== */

  const loadAddresses = async () => {
    try {
      setAddressLoading(true);
      setMessage("");

      const data = await getAddresses();

      const list = Array.isArray(
        data?.addresses
      )
        ? data.addresses
        : [];

      setAddresses(list);

      const defaultAddress = list.find(
        (item) => item.isDefault
      );

      setSelectedAddressId(
        defaultAddress?._id ||
          list[0]?._id ||
          ""
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to load addresses."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  /* =====================================================
     SELECTED ADDRESS
  ===================================================== */

  const selectedAddress = useMemo(
    () =>
      addresses.find(
        (item) =>
          String(item._id) ===
          String(selectedAddressId)
      ),
    [addresses, selectedAddressId]
  );

  /* =====================================================
     FORMAT ADDRESS
  ===================================================== */

  const formatAddress = (address) =>
    [
      address?.addressLine,
      address?.landmark,
      address?.city,
      address?.state,
      address?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

  /* =====================================================
     GET CURRENT LOCATION
  ===================================================== */

  const useCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setMessage("");

      const location =
        await getCurrentBrowserLocation();

      setAddressForm((current) => ({
        ...current,
        latitude: location.latitude,
        longitude: location.longitude,
      }));

      setMessage(
        "Current delivery location captured. Save the address to use it for delivery."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to get your current location."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  /* =====================================================
     ADDRESS INPUT
  ===================================================== */

  const handleAddressChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setAddressForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     SAVE NEW ADDRESS
  ===================================================== */

  const saveAddress = async (event) => {
    event.preventDefault();

    setMessage("");

    if (
      !/^\d{10}$/.test(
        addressForm.phone.trim()
      )
    ) {
      setMessage(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        addressForm.pincode.trim()
      )
    ) {
      setMessage(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (
      addressForm.fullName.trim().length <
      2
    ) {
      setMessage(
        "Please enter a valid full name."
      );
      return;
    }

    if (
      !addressForm.addressLine.trim()
    ) {
      setMessage(
        "Please enter your address."
      );
      return;
    }

    if (!addressForm.city.trim()) {
      setMessage(
        "Please enter your city."
      );
      return;
    }

    if (!addressForm.state.trim()) {
      setMessage(
        "Please enter your state."
      );
      return;
    }

    try {
      setSavingAddress(true);

      const data = await createAddress({
        ...addressForm,

        fullName:
          addressForm.fullName.trim(),

        phone:
          addressForm.phone.trim(),

        addressLine:
          addressForm.addressLine.trim(),

        landmark:
          addressForm.landmark.trim(),

        city:
          addressForm.city.trim(),

        state:
          addressForm.state.trim(),

        pincode:
          addressForm.pincode.trim(),

        latitude:
          Number(addressForm.latitude),

        longitude:
          Number(addressForm.longitude),
      });

      if (data?.address) {
        const newAddress =
          data.address;

        setAddresses((current) => {
          if (newAddress.isDefault) {
            return [
              newAddress,

              ...current.map(
                (item) => ({
                  ...item,
                  isDefault:
                    false,
                })
              ),
            ];
          }

          return [
            ...current,
            newAddress,
          ];
        });

        setSelectedAddressId(
          newAddress._id
        );
      } else {
        await loadAddresses();
      }

      setShowAddressForm(false);

      setAddressForm({
        fullName: "",
        phone: "",
        addressLine: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        addressType: "home",
        isDefault: false,
        latitude: "",
        longitude: "",
      });
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to save address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  /* =====================================================
     CART VALIDATION
  ===================================================== */

  const invalidItems = cart.filter(
    (item) => {
      if (item.isActive === false) {
        return true;
      }

      if (
        Number(item.stock || 0) <= 0
      ) {
        return true;
      }

      if (
        Number(item.quantity || 0) >
        Number(item.stock || 0)
      ) {
        return true;
      }

      if (
        Number(item.quantity || 0) <
        Number(item.minimumOrder || 1)
      ) {
        return true;
      }

      return false;
    }
  );

  /* =====================================================
     SHOP CHECKOUT DATA
  ===================================================== */

  const shopCheckoutData = useMemo(() => {
    return groupedCart.map((group) => {
      const subtotal = Number(
        group.items
          .reduce(
            (total, item) =>
              total +
              Number(
                item.finalPrice ??
                  item.price ??
                  0
              ) *
                Number(
                  item.quantity || 0
                ),
            0
          )
          .toFixed(2)
      );

      const deliveryCharge = Number(
        group.shop?.deliveryCharge ?? 0
      );

      const minimumOrder = Number(
        group.shop?.minimumOrder ?? 200
      );

      const minimumOrderRemaining =
        Math.max(
          0,
          Number(
            (
              minimumOrder -
              subtotal
            ).toFixed(2)
          )
        );

      return {
        ...group,

        subtotal,

        deliveryCharge,

        platformFee:
          PLATFORM_FEE_PER_SHOP,

        minimumOrder,

        minimumOrderRemaining,

        minimumOrderMet:
          subtotal >= minimumOrder,

        shopOpen:
          group.shop?.isOpen !== false,
      };
    });
  }, [groupedCart]);

  /* =====================================================
     TOTAL PLATFORM FEE
  ===================================================== */

  const totalPlatformFee = useMemo(
    () =>
      shopCheckoutData.reduce(
        (total) =>
          total + PLATFORM_FEE_PER_SHOP,
        0
      ),
    [shopCheckoutData]
  );

  /* =====================================================
     TOTAL DELIVERY
  ===================================================== */

  const totalDeliveryCharge = useMemo(
    () =>
      shopCheckoutData.reduce(
        (total, group) =>
          total +
          Number(
            group.deliveryCharge || 0
          ),
        0
      ),
    [shopCheckoutData]
  );

  /* =====================================================
     FINAL CHECKOUT TOTAL
  ===================================================== */

  const checkoutTotal = useMemo(
    () =>
      Number(
        (
          Number(cartSubtotal || 0) +
          Number(totalPlatformFee || 0) +
          Number(
            totalDeliveryCharge || 0
          )
        ).toFixed(2)
      ),
    [
      cartSubtotal,
      totalPlatformFee,
      totalDeliveryCharge,
    ]
  );

  /* =====================================================
     SHOP VALIDATION
  ===================================================== */

  const invalidShops =
    shopCheckoutData.filter(
      (group) =>
        !group.shopOpen ||
        !group.minimumOrderMet
    );

  /* =====================================================
     CHECKOUT VALIDATION
  ===================================================== */

  const validateCheckout = () => {
    if (!cart.length) {
      setMessage(
        "Your cart is empty."
      );

      return false;
    }

    if (invalidItems.length) {
      setMessage(
        `Please fix ${invalidItems[0].name} before checkout.`
      );

      return false;
    }

    if (invalidShops.length) {
      const shop =
        invalidShops[0];

      if (!shop.shopOpen) {
        setMessage(
          `${shop.shopName} is currently closed.`
        );
      } else {
        setMessage(
          `${shop.shopName} requires a minimum order of ₹${shop.minimumOrder}. Add ₹${shop.minimumOrderRemaining.toFixed(
            2
          )} more.`
        );
      }

      return false;
    }

    if (!selectedAddress) {
      setMessage(
        "Please select a delivery address."
      );

      return false;
    }

    if (
      !selectedAddress.phone ||
      !/^\d{10}$/.test(
        selectedAddress.phone
      )
    ) {
      setMessage(
        "Please select an address with a valid phone number."
      );

      return false;
    }

    if (
      !Number.isFinite(
        Number(
          selectedAddress.location?.latitude
        )
      ) ||
      !Number.isFinite(
        Number(
          selectedAddress.location?.longitude
        )
      )
    ) {
      setMessage(
        "Please select an address with a valid delivery location."
      );

      return false;
    }

    return true;
  };

  /* =====================================================
     COD ORDER
  ===================================================== */

  const handleCOD = async () => {
    try {
      setPlacingOrder(true);
      setMessage("");

      const data = await createOrder({
        deliveryAddress:
          formatAddress(
            selectedAddress
          ),

        customerPhone:
          selectedAddress.phone,

        paymentMethod: "cod",

        deliveryLatitude:
          Number(
            selectedAddress.location
              .latitude
          ),

        deliveryLongitude:
          Number(
            selectedAddress.location
              .longitude
          ),
      });

      await clearCart();

      navigate("/success", {
        state: {
          orders:
            data?.orders ||
            (data?.order
              ? [data.order]
              : []),

          checkoutGroupId:
            data?.checkoutGroupId,

          paymentMethod: "cod",

          totalAmount:
            data?.orders?.reduce(
              (total, order) =>
                total +
                Number(
                  order.totalAmount || 0
                ),
              0
            ) || checkoutTotal,
        },

        replace: true,
      });
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =====================================================
     ONLINE PAYMENT
  ===================================================== */

  const handleOnlinePayment = async () => {
    try {
      setPlacingOrder(true);
      setMessage("");

      if (
        !Number.isFinite(
          Number(
            selectedAddress?.location
              ?.latitude
          )
        ) ||
        !Number.isFinite(
          Number(
            selectedAddress?.location
              ?.longitude
          )
        )
      ) {
        throw new Error(
          "Please save a delivery location for the selected address."
        );
      }

      const paymentData =
        await createRazorpayOrder({
          deliveryLatitude:
            Number(
              selectedAddress.location
                .latitude
            ),

          deliveryLongitude:
            Number(
              selectedAddress.location
                .longitude
            ),
        });

      if (
        !paymentData?.razorpayOrderId ||
        !paymentData?.keyId ||
        !paymentData?.amount
      ) {
        throw new Error(
          "Unable to initialize payment."
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay failed to load. Please refresh and try again."
        );
      }

      const deliveryAddress =
        formatAddress(
          selectedAddress
        );

      const razorpay =
        new window.Razorpay({
          key: paymentData.keyId,

          amount:
            paymentData.amount,

          currency:
            paymentData.currency ||
            "INR",

          name: "FreshCart",

          description:
            paymentData.shopCount > 1
              ? `FreshCart order from ${paymentData.shopCount} shops`
              : "FreshCart Grocery Order",

          order_id:
            paymentData.razorpayOrderId,

          prefill: {
            name:
              selectedAddress.fullName,

            contact:
              selectedAddress.phone,
          },

          notes: {
            address:
              deliveryAddress,
          },

          theme: {
            color: "#16a34a",
          },

          handler: async (
            response
          ) => {
            try {
              setMessage(
                "Verifying payment..."
              );

              const verification =
                await verifyRazorpayPayment(
                  {
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,

                    deliveryAddress,

                    customerPhone:
                      selectedAddress.phone,

                    deliveryLatitude:
                      Number(
                        selectedAddress
                          .location
                          .latitude
                      ),

                    deliveryLongitude:
                      Number(
                        selectedAddress
                          .location
                          .longitude
                      ),
                  }
                );

              await clearCart();

              navigate("/success", {
                state: {
                  orders:
                    verification?.orders ||
                    (verification?.order
                      ? [
                          verification.order,
                        ]
                      : []),

                  checkoutGroupId:
                    verification?.checkoutGroupId,

                  paymentMethod:
                    "online",

                  totalAmount:
                    verification?.orders?.reduce(
                      (
                        total,
                        order
                      ) =>
                        total +
                        Number(
                          order.totalAmount ||
                            0
                        ),
                      0
                    ) ||
                    checkoutTotal,
                },

                replace: true,
              });
            } catch (error) {
              setMessage(
                error?.message ||
                  "Payment verification failed. Please contact support if money was deducted."
              );

              setPlacingOrder(false);
            }
          },

          modal: {
            ondismiss: () => {
              setPlacingOrder(false);

              setMessage(
                "Payment window closed."
              );
            },
          },
        });

      /* ---------------------------------------------
         PAYMENT FAILED
      --------------------------------------------- */

      razorpay.on(
        "payment.failed",
        async (response) => {
          setPlacingOrder(false);

          try {
            await reportPaymentFailure({
              razorpayOrderId:
                response?.error?.metadata
                  ?.order_id ||
                paymentData.razorpayOrderId,

              razorpayPaymentId:
                response?.error?.metadata
                  ?.payment_id ||
                "",

              errorDescription:
                response?.error
                  ?.description ||
                "Payment failed",
            });
          } catch (recordError) {
            console.error(
              "Unable to record payment failure:",
              recordError
            );
          }

          setMessage(
            response?.error
              ?.description ||
              "Payment failed. Please try again. Your cart remains available."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      setPlacingOrder(false);

      setMessage(
        error?.message ||
          "Unable to start payment."
      );
    }
  };

  /* =====================================================
     PLACE ORDER
  ===================================================== */

  const handlePlaceOrder = async () => {
    if (placingOrder) {
      return;
    }

    setMessage("");

    if (!validateCheckout()) {
      return;
    }

    if (paymentMethod === "cod") {
      await handleCOD();
    } else {
      await handleOnlinePayment();
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    cartLoading ||
    addressLoading
  ) {
    return (
      <div className="page-loader">
        <FaSpinner className="fa-spin" />

        Loading checkout...
      </div>
    );
  }

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (!cart.length) {
    return (
      <div className="professional-orders-page">
        <div className="professional-empty-orders">
          <h2>
            Your cart is empty
          </h2>

          <p>
            Add fresh products
            before checkout.
          </p>

          <Link
            to="/shop"
            className="professional-primary-btn"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="checkout-modern-page">
      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="checkout-topbar">
        <Link
          to="/cart"
          className="checkout-back-link"
        >
          <FaArrowLeft />
          Back to Cart
        </Link>

        <div>
          <span>
            FRESHCART
          </span>

          <strong>
            Secure Checkout
          </strong>
        </div>
      </header>

      <main className="checkout-container">
        {/* =================================================
            MAIN CHECKOUT
        ================================================= */}

        <div className="checkout-main">
          {/* =================================================
              DELIVERY ADDRESS
          ================================================= */}

          <section className="checkout-card">
            <div className="checkout-card-heading">
              <div>
                <span>01</span>

                <div>
                  <h2>
                    Delivery Address
                  </h2>

                  <p>
                    Where should we
                    deliver your order?
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddressForm(
                    (current) =>
                      !current
                  )
                }
              >
                <FaPlus />
                Add Address
              </button>
            </div>

            {/* Current location */}

            <button
              type="button"
              className="primary-button"
              onClick={
                useCurrentLocation
              }
              disabled={
                savingAddress ||
                locationLoading
              }
              style={{
                marginBottom:
                  "1rem",
              }}
            >
              {locationLoading ? (
                <FaSpinner className="fa-spin" />
              ) : (
                <FaLocationArrow />
              )}

              {locationLoading
                ? "Getting Current Location..."
                : "Use My Current Location"}
            </button>

            {/* =================================================
                ADDRESS FORM
            ================================================= */}

            {showAddressForm && (
              <form
                className="checkout-address-form"
                onSubmit={
                  saveAddress
                }
              >
                <input
                  name="fullName"
                  placeholder="Full Name"
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
                  placeholder="10-digit Phone"
                  value={
                    addressForm.phone
                  }
                  onChange={
                    handleAddressChange
                  }
                  maxLength={10}
                  inputMode="numeric"
                  required
                />

                <input
                  name="addressLine"
                  placeholder="House / Street / Area"
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
                  placeholder="6-digit Pincode"
                  value={
                    addressForm.pincode
                  }
                  onChange={
                    handleAddressChange
                  }
                  maxLength={6}
                  inputMode="numeric"
                  required
                />

                <label>
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

                  Set as default
                </label>

                <button
                  type="submit"
                  disabled={
                    savingAddress
                  }
                  className="professional-primary-btn"
                >
                  {savingAddress ? (
                    <FaSpinner className="fa-spin" />
                  ) : null}

                  Save Address
                </button>
              </form>
            )}

            {/* =================================================
                ADDRESS LIST
            ================================================= */}

            <div className="checkout-address-list">
              {!addresses.length ? (
                <div className="checkout-no-address">
                  <FaMapMarkerAlt />

                  <p>
                    No saved address.
                    Please add one.
                  </p>
                </div>
              ) : (
                addresses.map(
                  (address) => (
                    <label
                      className={`checkout-address-option ${
                        selectedAddressId ===
                        address._id
                          ? "selected"
                          : ""
                      }`}
                      key={
                        address._id
                      }
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={
                          selectedAddressId ===
                          address._id
                        }
                        onChange={() =>
                          setSelectedAddressId(
                            address._id
                          )
                        }
                      />

                      <div>
                        <strong>
                          {
                            address.fullName
                          }
                        </strong>

                        <p>
                          {formatAddress(
                            address
                          )}
                        </p>

                        <span>
                          📞{" "}
                          {
                            address.phone
                          }
                        </span>
                      </div>

                      {address.isDefault && (
                        <small>
                          Default
                        </small>
                      )}
                    </label>
                  )
                )
              )}
            </div>
          </section>

          {/* =================================================
              SELECTED ADDRESS
          ================================================= */}

          {selectedAddress && (
            <section className="checkout-card">
              <div className="checkout-card-heading">
                <div>
                  <span>✓</span>

                  <div>
                    <h2>
                      Delivering To
                    </h2>

                    <p>
                      {
                        selectedAddress.fullName
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",

                  gap: "12px",

                  alignItems:
                    "flex-start",
                }}
              >
                <FaMapMarkerAlt />

                <div>
                  <strong>
                    {
                      selectedAddress.fullName
                    }
                  </strong>

                  <p>
                    {formatAddress(
                      selectedAddress
                    )}
                  </p>

                  <p>
                    📞{" "}
                    {
                      selectedAddress.phone
                    }
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              PAYMENT METHOD
          ================================================= */}

          <section className="checkout-card">
            <div className="checkout-card-heading">
              <div>
                <span>02</span>

                <div>
                  <h2>
                    Payment Method
                  </h2>

                  <p>
                    Choose how you want
                    to pay.
                  </p>
                </div>
              </div>
            </div>

            <div className="checkout-payment-options">
              {/* COD */}

              <label
                className={`checkout-payment-option ${
                  paymentMethod === "cod"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={
                    paymentMethod ===
                    "cod"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <div>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order
                    arrives.
                  </span>
                </div>

                <FaCheckCircle />
              </label>

              {/* ONLINE */}

              <label
                className={`checkout-payment-option ${
                  paymentMethod ===
                  "online"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={
                    paymentMethod ===
                    "online"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <div>
                  <strong>
                    Online Payment
                  </strong>

                  <span>
                    Secure payment with
                    Razorpay.
                  </span>
                </div>

                <FaCreditCard />
              </label>
            </div>
          </section>
        </div>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <aside className="checkout-summary">
          <div className="checkout-summary-header">
            <span>03</span>

            <div>
              <h2>
                Order Summary
              </h2>

              <p>
                {groupedCart.length}{" "}
                {groupedCart.length ===
                1
                  ? "shop"
                  : "shops"}{" "}
                ·{" "}
                {cart.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantity ||
                        0
                    ),
                  0
                )}{" "}
                items
              </p>
            </div>
          </div>

          {/* Original */}

          <div className="checkout-total-row">
            <span>
              Original price
            </span>

            <strong>
              ₹
              {Number(
                cartOriginalTotal ||
                  0
              ).toFixed(2)}
            </strong>
          </div>

          {/* Discount */}

          {Number(
            cartDiscountTotal || 0
          ) > 0 && (
            <div className="checkout-total-row">
              <span>
                Discount
              </span>

              <strong>
                -₹
                {Number(
                  cartDiscountTotal
                ).toFixed(2)}
              </strong>
            </div>
          )}

          {/* Subtotal */}

          <div className="checkout-total-row">
            <span>
              Subtotal
            </span>

            <strong>
              ₹
              {Number(
                cartSubtotal || 0
              ).toFixed(2)}
            </strong>
          </div>

          {/* =================================================
              SHOP SUMMARY
          ================================================= */}

          <div className="checkout-shop-summary">
            {shopCheckoutData.map(
              (group) => (
                <div
                  key={
                    group.shopId
                  }
                  className="checkout-shop-block"
                >
                  <div className="checkout-shop-title">
                    <FaStore />

                    <strong>
                      {
                        group.shopName
                      }
                    </strong>

                    <span
                      style={{
                        marginLeft:
                          "auto",
                      }}
                    >
                      {group.shopOpen
                        ? "Open"
                        : "Closed"}
                    </span>
                  </div>

                  {/* Items */}

                  {group.items.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="checkout-summary-item"
                      >
                        <span>
                          {
                            item.name
                          }{" "}
                          ×{" "}
                          {
                            item.quantity
                          }
                        </span>

                        <strong>
                          ₹
                          {(
                            Number(
                              item.finalPrice ??
                                item.price ??
                                0
                            ) *
                            Number(
                              item.quantity ||
                                0
                            )
                          ).toFixed(2)}
                        </strong>
                      </div>
                    )
                  )}

                  {/* Shop subtotal */}

                  <div className="checkout-shop-total">
                    <span>
                      Shop Subtotal
                    </span>

                    <strong>
                      ₹
                      {Number(
                        group.subtotal
                      ).toFixed(2)}
                    </strong>
                  </div>

                  {/* Platform fee */}

                  <div className="checkout-shop-total">
                    <span>
                      Platform Fee
                    </span>

                    <strong>
                      ₹
                      {Number(
                        group.platformFee
                      ).toFixed(2)}
                    </strong>
                  </div>

                  {/* Minimum order */}

                  {group.minimumOrder >
                    0 && (
                    <div className="checkout-summary-item">
                      <span>
                        Minimum order
                      </span>

                      <strong>
                        ₹
                        {Number(
                          group.minimumOrder
                        ).toFixed(2)}
                      </strong>
                    </div>
                  )}

                  {/* Minimum order error */}

                  {!group.minimumOrderMet &&
                    group.shopOpen && (
                      <div
                        className="checkout-error"
                        style={{
                          marginTop:
                            "8px",
                        }}
                      >
                        Add ₹
                        {Number(
                          group.minimumOrderRemaining
                        ).toFixed(2)}{" "}
                        more to order
                        from this shop.
                      </div>
                    )}

                  {/* Shop closed */}

                  {!group.shopOpen && (
                    <div
                      className="checkout-error"
                      style={{
                        marginTop:
                          "8px",
                      }}
                    >
                      This shop is
                      currently
                      closed.
                    </div>
                  )}

                  {/* Delivery */}

                  <div className="checkout-shop-total">
                    <span>
                      <FaTruck />{" "}
                      Delivery
                    </span>

                    <strong>
                      {Number(
                        group.deliveryCharge
                      ) === 0
                        ? "FREE"
                        : `₹${Number(
                            group.deliveryCharge
                          ).toFixed(2)}`}
                    </strong>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Total platform fee */}

          <div className="checkout-total-row">
            <span>
              Platform Fee
            </span>

            <strong>
              ₹
              {totalPlatformFee.toFixed(
                2
              )}
            </strong>
          </div>

          {/* Total delivery */}

          <div className="checkout-total-row">
            <span>
              Total Delivery
            </span>

            <strong>
              {totalDeliveryCharge ===
              0
                ? "FREE"
                : `₹${totalDeliveryCharge.toFixed(
                    2
                  )}`}
            </strong>
          </div>

          {/* Grand total */}

          <div
            className="checkout-total-row"
            style={{
              fontSize: "1.15rem",
            }}
          >
            <span>
              Total Amount
            </span>

            <strong>
              ₹
              {checkoutTotal.toFixed(
                2
              )}
            </strong>
          </div>

          {/* Security note */}

          <div className="checkout-secure-note">
            🔐 Final prices, stock,
            shop status, minimum
            order and delivery
            charges are verified
            again by the FreshCart
            server.
          </div>

          {/* Error/message */}

          {message && (
            <div className="checkout-error">
              {message}
            </div>
          )}

          {/* =================================================
              PLACE ORDER BUTTON
          ================================================= */}

          <button
            type="button"
            className="professional-primary-btn checkout-place-btn"
            disabled={
              placingOrder ||
              !selectedAddress ||
              invalidItems.length >
                0 ||
              invalidShops.length >
                0
            }
            onClick={
              handlePlaceOrder
            }
          >
            {placingOrder ? (
              <>
                <FaSpinner className="fa-spin" />

                Processing...
              </>
            ) : paymentMethod ===
              "online" ? (
              <>
                <FaCreditCard />

                Pay ₹
                {checkoutTotal.toFixed(
                  2
                )}
              </>
            ) : (
              <>
                <FaCheckCircle />

                Place COD Order • ₹
                {checkoutTotal.toFixed(
                  2
                )}
              </>
            )}
          </button>
        </aside>
      </main>
    </div>
  );
}

export default Checkout;