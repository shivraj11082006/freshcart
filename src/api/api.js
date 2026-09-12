const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || ""
).trim();

const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "/api")
).replace(/\/$/, "");

const API_TIMEOUT_MS = 20000;

/* =====================================================
   AUTH
===================================================== */

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  try {
    const raw =
      localStorage.getItem("user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveAuthData = (
  token,
  user
) => {
  if (token) {
    localStorage.setItem(
      "token",
      token
    );
  }

  if (user) {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/* =====================================================
   REQUEST
===================================================== */

export const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (
    options.body &&
    !isFormData &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const controller =
    new AbortController();

  const timeoutId = window.setTimeout(
    () => {
      controller.abort();
    },
    API_TIMEOUT_MS
  );

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        signal:
          options.signal ||
          controller.signal,

        headers,
      }
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "The request took too long. Please check your connection and try again."
      );
    }

    console.error(
      "API connection error:",
      error
    );

    throw new Error(
      "Unable to connect to FreshCart. Please check your connection and try again."
    );
  } finally {
    window.clearTimeout(timeoutId);
  }

  let data = {};

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      const text =
        await response.text();

      data = {
        message: text,
      };
    }
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        data.error ||
        `Request failed (${response.status})`
    );

    error.status =
      response.status;

    error.response = data;

    throw error;
  }

  return data;
};

/* =====================================================
   AUTH
===================================================== */

export const registerUser = (
  userData
) =>
  apiRequest(
    "/auth/register",
    {
      method: "POST",

      body:
        JSON.stringify(userData),
    }
  );

export const loginUser = (
  loginData
) =>
  apiRequest(
    "/auth/login",
    {
      method: "POST",

      body:
        JSON.stringify(loginData),
    }
  );

export const verifyLoginOtp = ({
  email,
  password,
  otp,
}) =>
  apiRequest(
    "/auth/verify-otp",
    {
      method: "POST",

      body: JSON.stringify({
        email,
        password,
        otp,
      }),
    }
  );

export const resendOtp = (email) =>
  apiRequest(
    "/auth/resend-otp",
    {
      method: "POST",

      body: JSON.stringify({
        email,
      }),
    }
  );

export const forgotPassword = (
  email
) =>
  apiRequest(
    "/auth/forgot-password",
    {
      method: "POST",

      body: JSON.stringify({
        email,
      }),
    }
  );

export const resendResetOtp = (
  email
) =>
  apiRequest(
    "/auth/resend-reset-otp",
    {
      method: "POST",

      body: JSON.stringify({
        email,
      }),
    }
  );

export const resetPassword = ({
  email,
  otp,
  newPassword,
}) =>
  apiRequest(
    "/auth/reset-password",
    {
      method: "POST",

      body: JSON.stringify({
        email,
        otp,
        newPassword,
      }),
    }
  );

/* =====================================================
   PROFILE
===================================================== */

export const getProfile = () =>
  apiRequest("/users/profile");

export const updateProfile = (
  profileData
) =>
  apiRequest(
    "/users/profile",
    {
      method: "PUT",

      body:
        JSON.stringify(profileData),
    }
  );

export const changePassword = ({
  currentPassword,
  newPassword,
}) =>
  apiRequest(
    "/users/change-password",
    {
      method: "PUT",

      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

/* =====================================================
   PRODUCTS
===================================================== */

export const getProducts = async ({
  search = "",
  category = "All",
  minPrice = "",
  maxPrice = "",
  stock = "",
  shop = "",
  city = "",
  latitude = "",
  longitude = "",
  sort = "newest",
  includeOutOfStock = true,
} = {}) => {
  const params =
    new URLSearchParams();

  if (String(search).trim()) {
    params.set(
      "search",
      String(search).trim()
    );
  }

  if (
    category &&
    category !== "All"
  ) {
    params.set(
      "category",
      category
    );
  }

  if (
    minPrice !== "" &&
    minPrice !== null &&
    minPrice !== undefined
  ) {
    params.set(
      "minPrice",
      String(minPrice)
    );
  }

  if (
    maxPrice !== "" &&
    maxPrice !== null &&
    maxPrice !== undefined
  ) {
    params.set(
      "maxPrice",
      String(maxPrice)
    );
  }

  if (stock !== "") {
    params.set(
      "stock",
      String(stock)
    );
  }

  if (shop) {
    params.set("shop", shop);
  }

  if (city) {
    params.set("city", city);
  }

  if (
    latitude !== "" &&
    latitude !== null &&
    latitude !== undefined
  ) {
    params.set(
      "latitude",
      String(latitude)
    );
  }

  if (
    longitude !== "" &&
    longitude !== null &&
    longitude !== undefined
  ) {
    params.set(
      "longitude",
      String(longitude)
    );
  }

  if (sort) {
    params.set("sort", sort);
  }

  params.set(
    "includeOutOfStock",
    String(includeOutOfStock)
  );

  const query =
    params.toString();

  return apiRequest(
    `/products${
      query ? `?${query}` : ""
    }`
  );
};

export const getProductDiscoveryFilters =
  () =>
    apiRequest(
      "/products/discovery/filters"
    );

export const getProduct = (id) =>
  apiRequest(
    `/products/${id}`
  );

export const addProduct = (
  productData
) =>
  apiRequest(
    "/products",
    {
      method: "POST",

      body: productData,
    }
  );

export const updateProduct = (
  id,
  productData
) =>
  apiRequest(
    `/products/${id}`,
    {
      method: "PUT",

      body: productData,
    }
  );

export const deleteProduct = (
  id
) =>
  apiRequest(
    `/products/${id}`,
    {
      method: "DELETE",
    }
  );

export const getMyProducts = () =>
  apiRequest(
    "/products/my-products"
  );

/* =====================================================
   CART
===================================================== */

export const getCart = () =>
  apiRequest("/cart");

export const addProductToCart = (
  productId,
  quantity = 1
) =>
  apiRequest(
    "/cart/add",
    {
      method: "POST",

      body: JSON.stringify({
        productId,
        quantity,
      }),
    }
  );

export const updateCartItem = (
  productId,
  quantity
) =>
  apiRequest(
    "/cart/update",
    {
      method: "PATCH",

      body: JSON.stringify({
        productId,
        quantity,
      }),
    }
  );

export const removeCartItem = (
  productId
) =>
  apiRequest(
    `/cart/remove/${productId}`,
    {
      method: "DELETE",
    }
  );

export const clearServerCart = () =>
  apiRequest(
    "/cart/clear",
    {
      method: "DELETE",
    }
  );

/* =====================================================
   SHOPS
===================================================== */

export const createShop = (
  shopData
) =>
  apiRequest(
    "/shops",
    {
      method: "POST",

      body:
        JSON.stringify(shopData),
    }
  );

export const getMyShop = () =>
  apiRequest(
    "/shops/my-shop"
  );

export const updateMyShop = (
  shopData
) =>
  apiRequest(
    "/shops/my-shop",
    {
      method: "PUT",

      body:
        JSON.stringify(shopData),
    }
  );

export const updateShop = (
  shopData
) =>
  updateMyShop(shopData);

export const toggleShopStatus = () =>
  apiRequest(
    "/shops/toggle-status",
    {
      method: "PATCH",
    }
  );

export const getShops = ({
  search = "",
  city = "",
  openOnly = false,
} = {}) => {
  const params =
    new URLSearchParams();

  if (String(search).trim()) {
    params.set(
      "search",
      String(search).trim()
    );
  }

  if (String(city).trim()) {
    params.set(
      "city",
      String(city).trim()
    );
  }

  params.set(
    "openOnly",
    String(Boolean(openOnly))
  );

  const query =
    params.toString();

  return apiRequest(
    `/shops${
      query ? `?${query}` : ""
    }`
  );
};

export const getShop = (id) =>
  apiRequest(
    `/shops/${id}`
  );

/* =====================================================
   ADDRESSES
===================================================== */

export const getAddresses = () =>
  apiRequest("/addresses");

export const addAddress = (
  addressData
) =>
  apiRequest(
    "/addresses",
    {
      method: "POST",

      body:
        JSON.stringify(
          addressData
        ),
    }
  );

export const createAddress = (
  addressData
) =>
  addAddress(addressData);

export const updateAddress = (
  id,
  addressData
) =>
  apiRequest(
    `/addresses/${id}`,
    {
      method: "PUT",

      body:
        JSON.stringify(
          addressData
        ),
    }
  );

export const setDefaultAddress = (
  id
) =>
  apiRequest(
    `/addresses/${id}/default`,
    {
      method: "PATCH",
    }
  );

export const deleteAddress = (
  id
) =>
  apiRequest(
    `/addresses/${id}`,
    {
      method: "DELETE",
    }
  );

/* =====================================================
   ORDERS
===================================================== */

export const createOrder = (
  orderData
) =>
  apiRequest(
    "/orders",
    {
      method: "POST",

      body:
        JSON.stringify(orderData),
    }
  );

export const getMyOrders = () =>
  apiRequest(
    "/orders/my-orders"
  );

export const getMyOrder = (id) =>
  apiRequest(
    `/orders/my-orders/${id}`
  );

export const cancelMyOrder = (
  id,
  reason = ""
) =>
  apiRequest(
    `/orders/${id}/cancel`,
    {
      method: "PATCH",

      body: JSON.stringify({
        reason,
      }),
    }
  );

export const getShopkeeperOrders =
  () =>
    apiRequest(
      "/orders/shopkeeper"
    );

export const getShopkeeperOrder = (
  id
) =>
  apiRequest(
    `/orders/shopkeeper/${id}`
  );

export const updateOrderStatus = (
  orderId,
  orderStatus,
  reason = ""
) =>
  apiRequest(
    `/orders/${orderId}/status`,
    {
      method: "PATCH",

      body: JSON.stringify({
        orderStatus,
        reason,
      }),
    }
  );

/* =====================================================
   PAYMENTS
===================================================== */

export const createRazorpayOrder = (
  orderData = {}
) =>
  apiRequest(
    "/payments/create-order",
    {
      method: "POST",

      body:
        JSON.stringify(
          orderData
        ),
    }
  );

export const verifyRazorpayPayment = (
  paymentData
) =>
  apiRequest(
    "/payments/verify",
    {
      method: "POST",

      body:
        JSON.stringify(
          paymentData
        ),
    }
  );

export const reportPaymentFailure = (
  paymentData
) =>
  apiRequest(
    "/payments/failed",
    {
      method: "POST",

      body:
        JSON.stringify(
          paymentData
        ),
    }
  );

/* =====================================================
   NOTIFICATIONS
===================================================== */

export const getNotifications = (
  limit = 50
) => {
  const safeLimit = Math.min(
    Math.max(
      Number(limit) || 50,
      1
    ),
    100
  );

  return apiRequest(
    `/notifications?limit=${safeLimit}`
  );
};

export const getUnreadNotificationCount =
  () =>
    apiRequest(
      "/notifications/unread-count"
    );

export const markNotificationAsRead = (
  id
) =>
  apiRequest(
    `/notifications/${id}/read`,
    {
      method: "PATCH",
    }
  );

export const markNotificationRead = (
  id
) =>
  markNotificationAsRead(id);

export const markAllNotificationsAsRead =
  () =>
    apiRequest(
      "/notifications/read-all",
      {
        method: "PATCH",
      }
    );

export const deleteNotification = (
  id
) =>
  apiRequest(
    `/notifications/${id}`,
    {
      method: "DELETE",
    }
  );

export const clearReadNotifications =
  () =>
    apiRequest(
      "/notifications/read/clear",
      {
        method: "DELETE",
      }
    );

/* =====================================================
   PUSH NOTIFICATIONS
===================================================== */

export const registerPushToken = (
  token
) =>
  apiRequest(
    "/notifications/push-token",
    {
      method: "POST",

      body: JSON.stringify({
        token,
      }),
    }
  );

export const removePushToken = (
  token
) =>
  apiRequest(
    "/notifications/push-token",
    {
      method: "DELETE",

      body: JSON.stringify({
        token,
      }),
    }
  );

/* =====================================================
   DASHBOARD
===================================================== */

export const getShopkeeperDashboard =
  () =>
    apiRequest(
      "/dashboard/shopkeeper"
    );