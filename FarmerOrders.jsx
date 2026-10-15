import { useEffect, useState } from "react";
import { getCropImage } from "../components/cropImages";

function FarmerOrders({ farmer }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const loadOrders = () => {
    fetch(
      `http://127.0.0.1:8000/api/farmer/orders?farmer_id=${farmer.id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        return response.json();
      })
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((error) => {
        console.error("Error loading orders:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, [farmer.id]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            farmer_id: farmer.id,
          }),
        }
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.message !== "Order status updated successfully!"
      ) {
        throw new Error(data.message || "Failed to update order status");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
      alert(error.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-loading-icon">📦</div>
          <h3>Loading your orders...</h3>
          <p>Please wait while we fetch your latest transactions.</p>
        </div>
      </div>
    );
  }

  const confirmedOrders = orders.filter(
    (order) => order.status === "Confirmed"
  ).length;
  const activeOrders = orders.filter(
  (order) => order.status !== "Delivered"
).length;

const deliveredOrders = orders.filter(
  (order) => order.status === "Delivered"
).length;

  const totalQuantity = orders.reduce(
    (total, order) => total + Number(order.quantity || 0),
    0
  );

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );

  return (
    <div className="orders-page">
      {/* HERO */}
      <section className="orders-hero">
        <div className="orders-hero-content">
          <p className="orders-eyebrow">FARMER MARKETPLACE</p>

          <h1>
            Your Orders <span>📦</span>
          </h1>

          <p className="orders-hero-description">
            Track your confirmed sales and manage transactions
            created from accepted buyer offers.
          </p>
        </div>

        <div className="orders-hero-visual">
          <div className="orders-hero-circle">📦</div>

          <div className="orders-floating-badge">
            ✓ Secure Transaction
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="orders-stats">
        <div className="order-stat-card">
          <div className="order-stat-icon green">📦</div>
          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon blue">✓</div>
          <div>
            <span>Confirmed</span>
            <strong>{confirmedOrders}</strong>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon orange">⚖️</div>
          <div>
            <span>Total Quantity</span>
            <strong>{totalQuantity} kg</strong>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon purple">₹</div>
          <div>
            <span>Total Sales</span>
            <strong>
              ₹{totalRevenue.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
        
<div className="order-stat-card">
  <div className="order-stat-icon orange">🚚</div>
  <div>
    <span>Active Orders</span>
    <strong>{activeOrders}</strong>
  </div>
</div>

<div className="order-stat-card">
  <div className="order-stat-icon green">✓</div>
  <div>
    <span>Delivered Orders</span>
    <strong>{deliveredOrders}</strong>
  </div>
</div>

      </section>
      


      {/* ORDERS */}
      <section className="orders-content">
        <div className="orders-section-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>Orders generated from your accepted buyer offers</p>
          </div>

          <span className="orders-count">
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-order-icon">📦</div>
            <h3>No orders yet</h3>
            <p>
              When you accept a buyer's offer, the confirmed order
              will appear here.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="premium-order-card" key={order.id}>
                {/* TOP */}
                <div className="order-card-header">
                  <div className="order-product">
                    <div className="order-product-icon">
                      <img
                        src={getCropImage(order.crop_name)}
                        alt={order.crop_name || "Crop"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.parentElement.textContent = "🌾";
                        }}
                      />
                    </div>

                    <div>
                      <span className="order-label">
                        ORDER #{order.id}
                      </span>

                      <h3>{order.crop_name}</h3>
                      <p>Offer #{order.offer_id}</p>
                    </div>
                  </div>

                  <span className="premium-order-status">
                    <span>✓</span>
                    {order.status}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="order-information">
                  <div className="order-info-item">
                    <span>Quantity</span>
                    <strong>{order.quantity} kg</strong>
                  </div>

                  <div className="order-info-item">
                    <span>Price per kg</span>
                    <strong>₹{order.price_per_kg}</strong>
                  </div>

                  <div className="order-info-item">
                    <span>Buyer</span>
                    <strong>{order.buyer_name}</strong>
                  </div>

                  <div className="order-info-item">
                    <span>Order Status</span>
                    <strong className="confirmed-text">
                      {order.status}
                    </strong>
                  </div>
                </div>

                {/* STATUS MANAGEMENT */}
            
<div className="order-status-management">
  {order.status === "Delivered" ? (
    <div className="order-status-label">
      <span>Order Completed ✓</span>
      <small>This order has been delivered successfully.</small>
    </div>
  ) : (
    <>
      <div className="order-status-label">
        <span>Update Order Status</span>
        <small>Move the order through the delivery process</small>
      </div>

      <select
        value={order.status}
        disabled={updatingOrder === order.id}
        onChange={(event) =>
          updateOrderStatus(order.id, event.target.value)
        }
      >
        <option value={order.status}>{order.status}</option>
        {(
          {
            Confirmed: ["Processing"],
            Processing: ["Ready for Pickup"],
            "Ready for Pickup": ["Out for Delivery"],
            "Out for Delivery": ["Delivered"],
          }[order.status] || []
        ).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </>
  )}
</div>


                {/* BOTTOM */}
                <div className="order-card-footer">
                  <div className="order-security">
                    <span className="secure-icon">🛡️</span>

                    <div>
                      <strong>AgriConnect Verified Order</strong>
                      <small>Created after offer acceptance</small>
                    </div>
                  </div>

                  <div className="order-total">
                    <span>Total Order Value</span>
                    <strong>
                      ₹
                      {Number(order.total_amount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FarmerOrders;
