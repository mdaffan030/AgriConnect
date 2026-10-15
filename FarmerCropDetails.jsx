
import { useState } from "react";
import { getCropImage } from "../components/cropImages";

function FarmerCropDetails({ crop, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(crop?.quantity ?? 0);
  const [price, setPrice] = useState(crop?.expected_price ?? 0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!crop) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (quantity === "" || price === "" ||
        Number(quantity) < 0 || Number(price) < 0) {
      setError("Enter a valid quantity and price.");
      return;
    }

    const farmerId = Number(
      JSON.parse(localStorage.getItem("user") || "{}").id
    );

    if (!farmerId) {
      setError("Please log in again and try.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/crops/${crop.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: Number(quantity),
            expected_price: Number(price),
            farmer_id: farmerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update crop.");
      }

      setQuantity(data.crop.quantity);
      setPrice(data.crop.expected_price);
      crop.quantity = data.crop.quantity;
      crop.expected_price = data.crop.expected_price;
      setIsEditing(false);
      setMessage("Crop details updated successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-content">
      <button
        type="button"
        className="dashboard-view-all"
        onClick={onBack}
      >
        ← Back to My Crops
      </button>

      <section className="dashboard-listings">
        <div className="dashboard-section-header">
          <div>
            <span className="section-eyebrow">YOUR PRODUCE</span>
            <h2>{crop.crop_name}</h2>
            <p>View and manage your crop listing.</p>
          </div>
        </div>

        <div className="crop-card">
          <img
            src={getCropImage(crop.crop_name)}
            alt={crop.crop_name}
            style={{
              width: "100%",
              maxWidth: "280px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />

          <p>📍 Location: {crop.location}</p>
          <p>Listing ID: {crop.id}</p>

          {isEditing ? (
            <form onSubmit={handleSave}>
              <label>
                Available quantity (kg)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </label>

              <label>
                Expected price (₹/kg)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </label>

              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuantity(crop.quantity);
                  setPrice(crop.expected_price);
                  setIsEditing(false);
                  setError("");
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <p>
                Available quantity: <strong>{crop.quantity} kg</strong>
              </p>
              <p>
                Expected price: <strong>₹{crop.expected_price}/kg</strong>
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuantity(crop.quantity);
                  setPrice(crop.expected_price);
                  setIsEditing(true);
                  setMessage("");
                  setError("");
                }}
              >
                Edit Crop
              </button>
            </>
          )}

          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
        </div>
      </section>
    </div>
  );
}

export default FarmerCropDetails;
