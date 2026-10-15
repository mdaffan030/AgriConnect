import { useEffect, useState } from "react";
import { getCropImage } from "../components/cropImages";

function BuyerOrders({ buyer }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/buyer/orders?buyer_id=${buyer.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();

        if (isMounted) {
          setOrders(data.orders || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading orders:", error);

        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    const intervalId = setInterval(loadOrders, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [buyer.id]);


  if (loading) {
    return (
      <div className="buyer-orders-page">
        <div className="buyer-orders-loading">
          <div>📦</div>
          <h3>Loading your orders...</h3>
          <p>Fetching your latest purchases.</p>
        </div>
      </div>
    );
  }

  const totalQuantity = orders.reduce(
    (total, order) => total + Number(order.quantity || 0),
    0
  );

  const totalSpent = orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0
  );

  const confirmedOrders = orders.filter(
    (order) => order.status === "Confirmed"
  ).length;

  return (
    <div className="buyer-orders-page">
      {/* HERO */}
      <section className="buyer-orders-hero">
        <div>
          <p>BUYER MARKETPLACE</p>
          <h1>My Orders 📦</h1>
          <span>Track your purchases directly from farmers.</span>
        </div>

        <div className="buyer-orders-hero-icon">🛒</div>
      </section>

      {/* ORDER STATISTICS */}
      <section className="buyer-order-stats">
        <div className="buyer-order-stat">
          <div>📦</div>
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="buyer-order-stat">
          <div>✓</div>
          <span>Confirmed</span>
          <strong>{confirmedOrders}</strong>
        </div>

        <div className="buyer-order-stat">
          <div>⚖️</div>
          <span>Total Quantity</span>
          <strong>{totalQuantity} kg</strong>
        </div>

        <div className="buyer-order-stat">
          <div>₹</div>
          <span>Total Spent</span>
          <strong>₹{totalSpent.toLocaleString("en-IN")}</strong>
        </div>
      </section>

      {/* PURCHASE HISTORY */}
      <section className="buyer-orders-content">
        <div className="buyer-orders-heading">
          <div>
            <h2>Purchase History</h2>
            <p>Your purchases from farmers</p>
          </div>

          <span>
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="buyer-orders-empty">
            <div>🛒</div>
            <h3>No orders yet</h3>
            <p>Your accepted offers will appear here as orders.</p>
          </div>
        ) : (
          <div className="buyer-orders-list">
            {orders.map((order) => (
              <div className="buyer-order-card" key={order.id}>
                {/* ORDER HEADER */}
                <div className="buyer-order-top">
                  <div className="buyer-order-product">
                    <div className="buyer-product-icon">
                      <img
                        src={getCropImage(order.crop_name)}
                        alt={order.crop_name || "Crop"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.parentElement.textContent = "🌾";
                        }}
                      />
                    </div>

                    <div className="buyer-order-product-info">
                      <small>ORDER #{order.id}</small>
                      <h3>{order.crop_name}</h3>
                      <p>Offer #{order.offer_id}</p>
                    </div>
                  </div>

                  <span
                    className={`buyer-confirmed status-${String(
                      order.status || "unknown"
                    )
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    ✓ {order.status}
                  </span>
                </div>

                {/* ORDER DETAILS */}
                <div className="buyer-order-details">
                  <div>
                    <span>Quantity</span>
                    <strong>{order.quantity} kg</strong>
                  </div>

                  <div>
                    <span>Price / kg</span>
                    <strong>
                      ₹{Number(order.price_per_kg || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Farmer</span>
                    <strong>{order.farmer_name || "Farmer"}</strong>
                  </div>
                </div>

                {/* ORDER FOOTER */}
                <div className="buyer-order-footer">
                  <div>
                    <span>Order Total</span>
                    <strong>
                      ₹
                      {Number(order.total_amount || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="buyer-order-verified">
                    🛡️ AgriConnect Verified
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

export default BuyerOrders;