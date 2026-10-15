
import { useEffect, useState } from "react";
import { getCropImage } from "../components/cropImages";
import OfferModal from "../components/OfferModal";
import CropDetails from "./CropDetails";

function BuyerDashboard({ buyer, onLogout }) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const loadMarketplace = () => {
    fetch("http://127.0.0.1:8000/api/marketplace/crops")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch marketplace crops");
        }
        return response.json();
      })
      .then((data) => {
        const availableCrops = data.crops || [];
        setCrops(availableCrops);

        const hash = window.location.hash;

        if (hash.startsWith("#crop/")) {
          const cropId = Number(hash.split("/")[1]);
          const crop = availableCrops.find(
            (item) => item.id === cropId
          );

          if (crop) setSelectedCrop(crop);
        }
      })
      .catch((error) => {
        console.error("Error loading marketplace:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMarketplace();

    const handleHashChange = () => {
      const hash = window.location.hash;

      if (hash === "#marketplace" || hash === "") {
        setSelectedCrop(null);
        setShowOfferModal(false);
        return;
      }

      if (hash.startsWith("#crop/")) {
        const cropId = Number(hash.split("/")[1]);
        const crop = crops.find((item) => item.id === cropId);

        if (crop) setSelectedCrop(crop);
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [crops.length]);

  const openCropDetails = (crop) => {
    setSelectedCrop(crop);
    setShowOfferModal(false);
    window.location.hash = `crop/${crop.id}`;
  };

  const goBackToMarketplace = () => {
    setShowOfferModal(false);
    window.location.hash = "marketplace";
  };

  const openOrders = () => {
    window.location.hash = "buyer-orders";
  };

  if (selectedCrop) {
    return (
      <>
        <CropDetails
          crop={selectedCrop}
          onBack={goBackToMarketplace}
          onMakeOffer={() => setShowOfferModal(true)}
        />

        {showOfferModal && (
          <OfferModal
            crop={selectedCrop}
            buyer={buyer}
            onClose={() => setShowOfferModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="buyer-dashboard">
      <header className="buyer-header">
        <div>
          <h1>AgriConnect Marketplace 🛒</h1>
          <p>
            Welcome, {buyer.name}! Find fresh produce directly
            from farmers.
          </p>
        </div>

        <div className="buyer-header-actions">
          <button
            className="buyer-orders-button"
            onClick={openOrders}
          >
            📦 My Orders
          </button>

          <button onClick={onLogout}>🚪 Logout</button>
        </div>
      </header>

      <main className="buyer-marketplace">
        <div className="marketplace-title">
          <h2>Available Crops</h2>
          <p>Fresh produce listed directly by farmers</p>
        </div>

        {loading ? (
          <div className="marketplace-loading">
            Loading available crops...
          </div>
        ) : crops.length === 0 ? (
          <div className="marketplace-empty">
            <div>🌱</div>
            <h3>No crops available</h3>
            <p>Farmers haven't listed any crops yet.</p>
          </div>
        ) : (
          <div className="marketplace-grid">
            {crops.map((crop) => (
              <div className="marketplace-card" key={crop.id}>
                <div className="marketplace-card-top">
                  <div className="marketplace-crop-icon">
                    <img
                      src={getCropImage(crop.crop_name)}
                      alt={crop.crop_name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <span className="marketplace-status">
                    Available
                  </span>
                </div>

                <h3>{crop.crop_name}</h3>

                <p className="marketplace-location">
                  📍 {crop.location}
                </p>

                <div className="marketplace-details">
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
                  className="offer-button"
                  onClick={() => openCropDetails(crop)}
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BuyerDashboard;
