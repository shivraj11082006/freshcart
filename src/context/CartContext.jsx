import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getToken,
  getCart,
  addProductToCart,
  updateCartItem,
  removeCartItem,
  clearServerCart,
} from "../api/api";

const CartContext = createContext(null);

/* =====================================================
   HELPERS
===================================================== */

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const roundMoney = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const getDiscountedPrice = (product) => {
  const price = Math.max(0, toNumber(product?.price));

  const discount = Math.min(
    100,
    Math.max(0, toNumber(product?.discount))
  );

  if (
    product?.finalPrice !== undefined &&
    product?.finalPrice !== null
  ) {
    return roundMoney(Math.max(0, toNumber(product.finalPrice)));
  }

  return roundMoney(
    price - (price * discount) / 100
  );
};

/* =====================================================
   FORMAT CART
===================================================== */

function formatCartItems(cartData) {
  const items = Array.isArray(cartData?.items)
    ? cartData.items
    : [];

  return items
    .filter((item) => item?.product)
    .map((item) => {
      const product = item.product;
      const shop = product.shop || null;

      const originalPrice = roundMoney(
        Math.max(0, toNumber(product.price))
      );

      const discountPercent = Math.min(
        100,
        Math.max(0, toNumber(product.discount))
      );

      const finalPrice = getDiscountedPrice(product);

      const discountPerUnit = roundMoney(
        Math.max(0, originalPrice - finalPrice)
      );

      return {
        ...product,

        id: product._id,

        quantity: Math.max(
          0,
          Math.floor(toNumber(item.quantity))
        ),

        originalPrice,
        discountPercent,
        finalPrice,
        discountPerUnit,

        // Payable price
        price: finalPrice,

        minimumOrder: Math.max(
          1,
          Math.floor(toNumber(product.minimumOrder, 1))
        ),

        shop,
        shopId: shop?._id || null,
        shopName: shop?.shopName || "Shop",
      };
    });
}

/* =====================================================
   GROUP CART BY SHOP
===================================================== */

function groupCartByShop(items) {
  const groups = {};

  items.forEach((item) => {
    const shopId =
      item.shopId ||
      item.shopkeeper?._id ||
      item.shopkeeper ||
      "unknown-shop";

    if (!groups[shopId]) {
      groups[shopId] = {
        shopId,
        shop: item.shop || null,
        shopName: item.shopName || "Shop",
        items: [],
      };
    }

    groups[shopId].items.push(item);
  });

  return Object.values(groups);
}

/* =====================================================
   PROVIDER
===================================================== */

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  /* ===================================================
     LOAD CART
  =================================================== */

  const loadCart = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setCart([]);
      setCartError("");
      setCartLoading(false);
      return;
    }

    try {
      setCartLoading(true);
      setCartError("");

      const data = await getCart();

      setCart(formatCartItems(data?.cart));
    } catch (error) {
      setCart([]);

      setCartError(
        error?.message || "Unable to load cart"
      );
    } finally {
      setCartLoading(false);
    }
  }, []);

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* ===================================================
     ADD TO CART
  =================================================== */

  const addToCart = useCallback(async (product) => {
    const productId = product?._id || product?.id;

    if (!productId) {
      throw new Error("Invalid product.");
    }

    if (
      product?.availability &&
      !product.availability.canPurchase
    ) {
      throw new Error(
        "This product is currently unavailable."
      );
    }

    const stock = Math.floor(toNumber(product?.stock));

    if (stock <= 0) {
      throw new Error("This product is out of stock.");
    }

    const minimumOrder = Math.max(
      1,
      Math.floor(toNumber(product?.minimumOrder, 1))
    );

    if (minimumOrder > stock) {
      throw new Error(
        `Minimum order is ${minimumOrder}, but only ${stock} item(s) are available`
      );
    }

    try {
      setCartError("");

      const data = await addProductToCart(
        productId,
        minimumOrder
      );

      if (data?.cart) {
        setCart(formatCartItems(data.cart));
      }

      return data;
    } catch (error) {
      setCartError(
        error?.message || "Unable to add product to cart"
      );

      throw error;
    }
  }, []);

  /* ===================================================
     INCREASE
  =================================================== */

  const increaseQuantity = useCallback(
    async (id) => {
      const item = cart.find(
        (product) =>
          String(product.id) === String(id)
      );

      if (!item) {
        return;
      }

      const currentQuantity = Math.max(
        0,
        Math.floor(toNumber(item.quantity))
      );

      const stock = Math.max(
        0,
        Math.floor(toNumber(item.stock))
      );

      const newQuantity = currentQuantity + 1;

      if (newQuantity > stock) {
        throw new Error(
          `Only ${stock} item(s) available`
        );
      }

      try {
        setCartError("");

        const data = await updateCartItem(
          id,
          newQuantity
        );

        if (data?.cart) {
          setCart(formatCartItems(data.cart));
        } else {
          await loadCart();
        }

        return data;
      } catch (error) {
        setCartError(
          error?.message ||
            "Unable to increase quantity"
        );

        throw error;
      }
    },
    [cart, loadCart]
  );

  /* ===================================================
     DECREASE
  =================================================== */

  const decreaseQuantity = useCallback(
    async (id) => {
      const item = cart.find(
        (product) =>
          String(product.id) === String(id)
      );

      if (!item) {
        return;
      }

      const minimumOrder = Math.max(
        1,
        Math.floor(toNumber(item.minimumOrder, 1))
      );

      const currentQuantity = Math.max(
        0,
        Math.floor(toNumber(item.quantity))
      );

      if (currentQuantity <= 1) {
        return removeFromCart(id);
      }

      const newQuantity = currentQuantity - 1;

      if (newQuantity < minimumOrder) {
        throw new Error(
          `Minimum order is ${minimumOrder}`
        );
      }

      try {
        setCartError("");

        const data = await updateCartItem(
          id,
          newQuantity
        );

        if (data?.cart) {
          setCart(formatCartItems(data.cart));
        } else {
          await loadCart();
        }

        return data;
      } catch (error) {
        setCartError(
          error?.message ||
            "Unable to decrease quantity"
        );

        throw error;
      }
    },
    [cart, loadCart]
  );

  /* ===================================================
     REMOVE
  =================================================== */

  const removeFromCart = useCallback(
    async (id) => {
      try {
        setCartError("");

        const data = await removeCartItem(id);

        if (data?.cart) {
          setCart(formatCartItems(data.cart));
        } else {
          setCart((current) =>
            current.filter(
              (item) =>
                String(item.id) !== String(id)
            )
          );
        }

        return data;
      } catch (error) {
        setCartError(
          error?.message ||
            "Unable to remove product"
        );

        throw error;
      }
    },
    []
  );

  /* ===================================================
     CLEAR CART
  =================================================== */

  const clearCart = useCallback(async () => {
    try {
      setCartError("");

      const data = await clearServerCart();

      if (data?.cart) {
        setCart(formatCartItems(data.cart));
      } else {
        setCart([]);
      }

      return data;
    } catch (error) {
      setCartError(
        error?.message ||
          "Unable to clear cart"
      );

      throw error;
    }
  }, []);

  /* ===================================================
     CART COUNT
  =================================================== */

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Math.max(
            0,
            Math.floor(toNumber(item.quantity))
          ),
        0
      ),
    [cart]
  );

  /* ===================================================
     TOTALS
  =================================================== */

  const cartOriginalTotal = useMemo(
    () =>
      roundMoney(
        cart.reduce(
          (total, item) =>
            total +
            toNumber(item.originalPrice) *
              Math.max(
                0,
                toNumber(item.quantity)
              ),
          0
        )
      ),
    [cart]
  );

  const cartDiscountTotal = useMemo(
    () =>
      roundMoney(
        cart.reduce(
          (total, item) =>
            total +
            toNumber(item.discountPerUnit) *
              Math.max(
                0,
                toNumber(item.quantity)
              ),
          0
        )
      ),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      roundMoney(
        cart.reduce(
          (total, item) =>
            total +
            toNumber(
              item.finalPrice ?? item.price
            ) *
              Math.max(
                0,
                toNumber(item.quantity)
              ),
          0
        )
      ),
    [cart]
  );

  const cartTotal = cartSubtotal;

  /* ===================================================
     GROUPED CART
  =================================================== */

  const groupedCart = useMemo(
    () => groupCartByShop(cart),
    [cart]
  );

  /* ===================================================
     SHOP TOTAL
  =================================================== */

  const getShopTotal = useCallback(
    (shopId) =>
      roundMoney(
        cart
          .filter(
            (item) =>
              String(item.shopId) ===
              String(shopId)
          )
          .reduce(
            (total, item) =>
              total +
              toNumber(
                item.finalPrice ?? item.price
              ) *
                Math.max(
                  0,
                  toNumber(item.quantity)
                ),
            0
          )
      ),
    [cart]
  );

  const getShopDiscount = useCallback(
    (shopId) =>
      roundMoney(
        cart
          .filter(
            (item) =>
              String(item.shopId) ===
              String(shopId)
          )
          .reduce(
            (total, item) =>
              total +
              toNumber(
                item.discountPerUnit
              ) *
                Math.max(
                  0,
                  toNumber(item.quantity)
                ),
            0
          )
      ),
    [cart]
  );

  /* ===================================================
     CONTEXT
  =================================================== */

  const value = useMemo(
    () => ({
      cart,
      setCart,

      cartCount,

      cartOriginalTotal,
      cartDiscountTotal,
      cartSubtotal,
      cartTotal,

      groupedCart,
      getShopTotal,
      getShopDiscount,

      cartLoading,
      cartError,
      setCartError,

      loadCart,

      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      cartCount,
      cartOriginalTotal,
      cartDiscountTotal,
      cartSubtotal,
      cartTotal,
      groupedCart,
      getShopTotal,
      getShopDiscount,
      cartLoading,
      cartError,
      loadCart,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}