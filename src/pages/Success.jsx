import {
  useMemo,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  FaCheckCircle,
  FaStore,
} from "react-icons/fa";

import "../App.css";

function Success() {
  const location =
    useLocation();

  const state =
    location.state || {};

  const orders = useMemo(
    () => {
      if (
        Array.isArray(
          state.orders
        ) &&
        state.orders.length
      ) {
        return state.orders;
      }

      if (state.order) {
        return [
          state.order,
        ];
      }

      return [];
    },
    [state]
  );

  const checkoutGroupId =
    state.checkoutGroupId ||
    orders[0]
      ?.checkoutGroupId ||
    "";

  const total =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.totalAmount ||
            0
        ),
      0
    );

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>

        <span className="success-eyebrow">
          FRESHCART
        </span>

        <h1>
          Order Placed
          Successfully! 🎉
        </h1>

        <p>
          Your order has been
          successfully placed. Each
          shop will manage its own
          order separately.
        </p>

        {checkoutGroupId && (
          <div className="success-checkout-group">
            <span>
              CHECKOUT GROUP
            </span>

            <strong>
              {checkoutGroupId}
            </strong>
          </div>
        )}

        {orders.length > 0 && (
          <div className="success-orders">
            <div className="success-orders-heading">
              <span>
                {orders.length}{" "}
                {orders.length ===
                1
                  ? "ORDER"
                  : "ORDERS"}{" "}
                CREATED
              </span>
            </div>

            {orders.map(
              (order) => (
                <div
                  className="success-order"
                  key={
                    order._id
                  }
                >
                  <div className="success-order-shop">
                    <FaStore />

                    <div>
                      <strong>
                        {order.shop
                          ?.shopName ||
                          "FreshCart Shop"}
                      </strong>

                      <span>
                        Order #
                        {String(
                          order._id
                        ).slice(
                          -8
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="success-order-right">
                    <span>
                      {order.orderStatus ||
                        "pending"}
                    </span>

                    <strong>
                      ₹
                      {Number(
                        order.totalAmount ||
                          0
                      ).toFixed(
                        2
                      )}
                    </strong>
                  </div>
                </div>
              )
            )}

            <div className="success-total">
              <span>
                Total Paid / Payable
              </span>

              <strong>
                ₹
                {total.toFixed(
                  2
                )}
              </strong>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link
            to="/orders"
            className="professional-primary-btn"
          >
            View My Orders
          </Link>

          <Link
            to="/shop"
            className="professional-secondary-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Success;