import { useState } from "react";
import { addCrop } from "../services/api";

function AddCrop({ farmer, onCropAdded, onClose }) {
  const [form, setForm] = useState({
    crop_name: "",
    quantity: "",
    expected_price: "",
    location: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const result = await addCrop({
  crop_name: form.crop_name,
  quantity: Number(form.quantity),
  expected_price: Number(form.expected_price),
  location: form.location,
  farmer_id: farmer.id,
});

      setMessage("Crop listed successfully!");

      setForm({
        crop_name: "",
        quantity: "",
        expected_price: "",
        location: "",
      });

      if (onCropAdded) {
        onCropAdded(result.crop);
      }

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 800);

    } catch (error) {
      console.error(error);
      setMessage("Failed to list crop.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">

      <div className="crop-modal">

        <div className="modal-header">
          <div>
            <h2>List New Crop 🌾</h2>
            <p>Enter details about your agricultural produce.</p>
          </div>

          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <label>
            Crop Name
          </label>

          <input
            type="text"
            name="crop_name"
            placeholder="e.g. Tomato"
            value={form.crop_name}
            onChange={handleChange}
            required
          />


          <label>
            Quantity (kg)
          </label>

          <input
            type="number"
            name="quantity"
            placeholder="e.g. 500"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            required
          />


          <label>
            Expected Price (₹/kg)
          </label>

          <input
            type="number"
            name="expected_price"
            placeholder="e.g. 25"
            value={form.expected_price}
            onChange={handleChange}
            min="1"
            required
          />


          <label>
            Location
          </label>

          <input
            type="text"
            name="location"
            placeholder="e.g. Hyderabad"
            value={form.location}
            onChange={handleChange}
            required
          />


          {message && (
            <div className="form-message">
              {message}
            </div>
          )}


          <button
            type="submit"
            className="submit-crop-button"
            disabled={loading}
          >
            {loading ? "Listing..." : "List Crop"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddCrop;