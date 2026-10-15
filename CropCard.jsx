
import { useState } from "react";
import { getCropImage } from "./cropImages";

function CropCard({ crop, onViewDetails }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl = getCropImage(crop.crop_name);

  return (
    <div className="crop-card">
      <div className="crop-card-top">
        <div className="crop-image">
          {!imageFailed ? (
            <img
              src={imageUrl}
              alt={crop.crop_name}
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="crop-image-fallback">🌾</span>
          )}
        </div>

        <span className="status">Active</span>
      </div>

      <h3>{crop.crop_name}</h3>

      <p className="crop-location">📍 {crop.location}</p>

      <div className="crop-details">
        <div>
          <span>Quantity</span>
          <strong>{crop.quantity} kg</strong>
        </div>

        <div>
          <span>Expected Price</span>
          <strong>₹{crop.expected_price}/kg</strong>
        </div>
      </div>

      <button
        className="crop-action"
        type="button"
        onClick={() => {
          console.log("View Details clicked:", crop);
          if (onViewDetails) {
            onViewDetails(crop);
          }
        }}
      >
        View Details →
      </button>
    </div>
  );
}

export default CropCard;
