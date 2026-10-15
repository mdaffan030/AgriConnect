
import { useEffect, useState } from "react";
import { getCropImage } from "../components/cropImages";

function FarmerOffers({ farmer }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOffer, setUpdatingOffer] = useState(null);

  const loadOffers = () => {
    fetch(
      `http://127.0.0.1:8000/api/farmer/offers?farmer_id=${farmer.id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch offers");
        }
        return response.json();
      })
      .then((data) => {
        setOffers(data.offers || []);
      })
      .catch((error) => {
        console.error("Error loading offers:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOffers();
  }, [farmer.id]);

  const updateOfferStatus = async (offerId, status) => {
    setUpdatingOffer(offerId);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/offers/${offerId}/status?status=${status}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Failed to update offer");
      }

      const data = await response.json();

      setOffers((currentOffers) =>
        currentOffers.map((offer) =>
          offer.id === offerId
            ? { ...offer, status: data.offer.status }
            : offer
        )
      );
    } catch (error) {
      console.error("Error updating offer:", error);
      alert("Failed to update offer.");
    } finally {
      setUpdatingOffer(null);
    }
  };

  const pendingOffers = offers.filter(
    (offer) => offer.status === "Pending"
  ).length;

  const acceptedOffers = offers.filter(
    (offer) => offer.status === "Accepted"
  ).length;

  const totalOfferValue = offers.reduce(
    (total, offer) =>
      total + Number(offer.quantity || 0) * Number(offer.offer_price || 0),
    0
  );

  if (loading) {
    return (
      <div className="offers-page">
        <div className="offers-loading">Loading your offers...</div>
      </div>
    );
  }

  return (
    <div className="offers-page">
      <section className="offers-hero">
        <div>
          <p className="offers-eyebrow">FARMER MARKETPLACE</p>
          <h1>Your Offers <span>💰</span></h1>
          <p>
            Review and manage offers from buyers interested
            in your agricultural produce.
          </p>
        </div>
        <div className="offers-hero-icon">🤝</div>
      </section>

      <section className="offer-stats">
        <div className="offer-stat-card">
          <div className="offer-stat-icon green">📩</div>
          <div>
            <span>Total Offers</span>
            <strong>{offers.length}</strong>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="offer-stat-icon orange">⏳</div>
          <div>
            <span>Pending</span>
            <strong>{pendingOffers}</strong>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="offer-stat-icon blue">✓</div>
          <div>
            <span>Accepted</span>
            <strong>{acceptedOffers}</strong>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="offer-stat-icon purple">₹</div>
          <div>
            <span>Total Value</span>
            <strong>₹{totalOfferValue.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </section>

      <section className="offers-content">
        <div className="offers-section-heading">
          <div>
            <h2>Incoming Offers</h2>
            <p>Buyers interested in your listed crops</p>
          </div>
          <span className="offers-count">{offers.length} offers</span>
        </div>

        {offers.length === 0 ? (
          <div className="offers-empty">
            <div className="empty-offer-icon">🌱</div>
            <h3>No offers yet</h3>
            <p>
              When buyers make offers for your crops,
              they will appear here.
            </p>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map((offer) => (
              <div className="modern-offer-card" key={offer.id}>
                <div className="modern-offer-top">
                  <div className="crop-icon-large">
                    <img
                      src={getCropImage(offer.crop_name)}
                      alt={offer.crop_name || "Crop"}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="crop-title-area">
                    <h3>{offer.crop_name}</h3>
                    <p>Offer #{offer.id}</p>
                  </div>

                  <span
                    className={`modern-status ${String(
                      offer.status
                    ).toLowerCase()}`}
                  >
                    {offer.status === "Pending" && "⏳ "}
                    {offer.status === "Accepted" && "✓ "}
                    {offer.status === "Rejected" && "✕ "}
                    {offer.status}
                  </span>
                </div>

                <div className="buyer-info">
                  <div className="buyer-avatar">🛒</div>
                  <div>
                    <span>Buyer</span>
                    <strong>AgriConnect Buyer</strong>
                  </div>
                </div>

                <div className="modern-offer-details">
                  <div className="modern-detail">
                    <span>Quantity</span>
                    <strong>{offer.quantity} kg</strong>
                  </div>

                  <div className="modern-detail">
                    <span>Offer Price</span>
                    <strong className="offer-price">
                      ₹{offer.offer_price}
                      <small>/kg</small>
                    </strong>
                  </div>
                </div>

                <div className="offer-value-box">
                  <div>
                    <span>Total Offer Value</span>
                    <strong>
                      ₹{(
                        Number(offer.quantity || 0) *
                        Number(offer.offer_price || 0)
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="value-icon">💰</div>
                </div>

                {offer.status === "Pending" ? (
                  <div className="modern-offer-actions">
                    <button
                      className="modern-reject"
                      onClick={() =>
                        updateOfferStatus(offer.id, "Rejected")
                      }
                      disabled={updatingOffer === offer.id}
                    >
                      ✕ Reject
                    </button>

                    <button
                      className="modern-accept"
                      onClick={() =>
                        updateOfferStatus(offer.id, "Accepted")
                      }
                      disabled={updatingOffer === offer.id}
                    >
                      {updatingOffer === offer.id
                        ? "Updating..."
                        : "✓ Accept Offer"}
                    </button>
                  </div>
                ) : (
                  <div
                    className={`offer-result ${String(
                      offer.status
                    ).toLowerCase()}`}
                  >
                    {offer.status === "Accepted"
                      ? "✓ You accepted this offer"
                      : "✕ You rejected this offer"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FarmerOffers;
