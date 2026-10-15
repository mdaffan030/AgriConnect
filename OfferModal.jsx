import { useState } from "react";
import { createOffer } from "../services/api";

function OfferModal({ crop, buyer, onClose }) {
  const [quantity, setQuantity] = useState(crop.quantity);
  const [offerPrice, setOfferPrice] = useState(crop.expected_price);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalAmount =
    Number(quantity || 0) * Number(offerPrice || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(quantity) <= 0 || Number(offerPrice) <= 0) {
      setMessage("Please enter valid quantity and price.");
      return;
    }

    if (Number(quantity) > Number(crop.quantity)) {
      setMessage(`Maximum available quantity is ${crop.quantity} kg.`);
      return;
    }

    setSubmitting(true);
    setMessage("Submitting offer...");

    try {
      const result = await createOffer({
        crop_id: crop.id,
        buyer_id: buyer.id,
        offer_price: Number(offerPrice),
        quantity: Number(quantity),
      });

      setMessage(result.message);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="offer-modal-overlay">
      <div className="offer-modal">

        <button
          className="offer-modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="offer-modal-icon">
          🌾
        </div>

        <h2>Make an Offer</h2>

        <p className="offer-modal-crop">
          {crop.crop_name}
        </p>

        <div className="offer-reference">
          <div>
            <span>Farmer's Price</span>
            <strong>₹{crop.expected_price}/kg</strong>
          </div>

          <div>
            <span>Available</span>
            <strong>{crop.quantity} kg</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Quantity (kg)</label>

          <input
            type="number"
            min="1"
            max={crop.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <label>Your Offer Price (₹/kg)</label>

          <input
            type="number"
            min="1"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            required
          />

          <div className="offer-total">
            <span>Total Offer</span>
            <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </div>

          {message && (
            <div className="offer-message">
              {message}
            </div>
          )}

          <div className="offer-modal-actions">

            <button
              type="button"
              className="cancel-offer"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-offer"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Offer"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default OfferModal;