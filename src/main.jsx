import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./index.css";

import App from "./App.jsx";

import Shop from "./pages/Shop.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Success from "./pages/Success.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Account from "./pages/Account.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import Notifications from "./pages/Notifications.jsx";

import ShopkeeperDashboard from "./pages/ShopkeeperDashboard.jsx";
import ShopkeeperOrders from "./pages/ShopkeeperOrders.jsx";
import CreateShop from "./pages/CreateShop.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import MyProducts from "./pages/MyProducts.jsx";
import EditProduct from "./pages/EditProduct.jsx";
import ShopSettings from "./pages/ShopSettings.jsx";

import DeliveryPartnerDashboard from "./pages/DeliveryPartnerDashboard.jsx";

import {
  CartProvider,
} from "./context/CartContext.jsx";

/* =====================================================
   HELPERS
===================================================== */

function getUser() {
  try {
    const raw =
      localStorage.getItem(
        "user"
      );

    return raw
      ? JSON.parse(raw)
      : null;
  } catch {
    return null;
  }
}

function getRole() {
  const user =
    getUser();

  return String(
    user?.role || ""
  )
    .trim()
    .toLowerCase();
}

/* =====================================================
   SHOPKEEPER ROUTE
===================================================== */

function ShopkeeperRoute({
  children,
}) {
  const user =
    getUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    getRole() !==
    "shopkeeper"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

/* =====================================================
   CUSTOMER AUTH ROUTE
===================================================== */

function CustomerAuthRoute({
  children,
}) {
  const user =
    getUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    getRole() ===
    "shopkeeper"
  ) {
    return (
      <Navigate
        to="/shopkeeper-dashboard"
        replace
      />
    );
  }

  if (
    getRole() ===
    "delivery_partner"
  ) {
    return (
      <Navigate
        to="/delivery-dashboard"
        replace
      />
    );
  }

  return children;
}

/* =====================================================
   PUBLIC CUSTOMER ROUTE
===================================================== */

function PublicCustomerRoute({
  children,
}) {
  const role =
    getRole();

  if (
    role ===
    "shopkeeper"
  ) {
    return (
      <Navigate
        to="/shopkeeper-dashboard"
        replace
      />
    );
  }

  if (
    role ===
    "delivery_partner"
  ) {
    return (
      <Navigate
        to="/delivery-dashboard"
        replace
      />
    );
  }

  return children;
}

/* =====================================================
   DELIVERY PARTNER ROUTE
===================================================== */

function DeliveryPartnerRoute({
  children,
}) {
  const user =
    getUser();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    getRole() !==
    "delivery_partner"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

/* =====================================================
   APP
===================================================== */

createRoot(
  document.getElementById(
    "root"
  )
).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={
              <PublicCustomerRoute>
                <App />
              </PublicCustomerRoute>
            }
          />

          {/* AUTH */}

          <Route
            path="/login"
            element={
              <Login />
            }
          />

          <Route
            path="/register"
            element={
              <Register />
            }
          />

          {/* PUBLIC CUSTOMER */}

          <Route
            path="/shop"
            element={
              <PublicCustomerRoute>
                <Shop />
              </PublicCustomerRoute>
            }
          />

          <Route
            path="/products"
            element={
              <PublicCustomerRoute>
                <Products />
              </PublicCustomerRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <PublicCustomerRoute>
                <ProductDetails />
              </PublicCustomerRoute>
            }
          />

          {/* CUSTOMER AUTH */}

          <Route
            path="/cart"
            element={
              <CustomerAuthRoute>
                <Cart />
              </CustomerAuthRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <CustomerAuthRoute>
                <Checkout />
              </CustomerAuthRoute>
            }
          />

          <Route
            path="/success"
            element={
              <CustomerAuthRoute>
                <Success />
              </CustomerAuthRoute>
            }
          />

          <Route
            path="/account"
            element={
              <CustomerAuthRoute>
                <Account />
              </CustomerAuthRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <CustomerAuthRoute>
                <Orders />
              </CustomerAuthRoute>
            }
          />

          <Route
            path="/order/:id"
            element={
              <CustomerAuthRoute>
                <OrderDetails />
              </CustomerAuthRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <CustomerAuthRoute>
                <Notifications />
              </CustomerAuthRoute>
            }
          />

          {/* SHOPKEEPER */}

          <Route
            path="/shopkeeper-dashboard"
            element={
              <ShopkeeperRoute>
                <ShopkeeperDashboard />
              </ShopkeeperRoute>
            }
          />

          <Route
            path="/create-shop"
            element={
              <ShopkeeperRoute>
                <CreateShop />
              </ShopkeeperRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ShopkeeperRoute>
                <AddProduct />
              </ShopkeeperRoute>
            }
          />

          <Route
            path="/my-products"
            element={
              <ShopkeeperRoute>
                <MyProducts />
              </ShopkeeperRoute>
            }
          />

          <Route
            path="/edit-product/:id"
            element={
              <ShopkeeperRoute>
                <EditProduct />
              </ShopkeeperRoute>
            }
          />

          <Route
            path="/shop-settings"
            element={
              <ShopkeeperRoute>
                <ShopSettings />
              </ShopkeeperRoute>
            }
          />

          <Route
            path="/shopkeeper-orders"
            element={
              <ShopkeeperRoute>
                <ShopkeeperOrders />
              </ShopkeeperRoute>
            }
          />

          {/* DELIVERY PARTNER */}

          <Route
            path="/delivery-dashboard"
            element={
              <DeliveryPartnerRoute>
                <DeliveryPartnerDashboard />
              </DeliveryPartnerRoute>
            }
          />

          {/* FALLBACK */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>
);