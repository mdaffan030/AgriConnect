
import { useEffect, useState } from "react";
import { getCrops } from "../services/api";
import CropCard from "../components/CropCard";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AddCrop from "../components/AddCrop";
import FarmerCropDetails from "./FarmerCropDetails";

function FarmerDashboard({ farmer, onLogout, onNavigate }) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    getCrops(farmer.id)
      .then((data) => {
        setCrops(data.crops || []);
      })
      .catch((error) => {
        console.error("Error loading crops:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [farmer.id]);

  const totalQuantity = crops.reduce(
    (total, crop) => total + Number(crop.quantity || 0),
    0
  );

  const estimatedValue = crops.reduce(
    (total, crop) =>
      total +
      Number(crop.quantity || 0) *
        Number(crop.expected_price || 0),
    0
  );

  return (
    <div className="app-layout">
      <Sidebar
        farmer={farmer}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <div className="main-area">
        <Topbar farmer={farmer} />

        <main className="dashboard-content">
          {selectedCrop ? (
            <FarmerCropDetails
              crop={selectedCrop}
              onBack={() => setSelectedCrop(null)}
            />
          ) : (
            <>
              {/* HERO */}
              <section className="dashboard-hero">
                <div className="dashboard-hero-content">
                  <div className="dashboard-eyebrow">
                    <span>🌱</span>
                    FARMER DASHBOARD
                  </div>

                  <h1>
                    Welcome back,
                    <br />
                    <span>{farmer?.name || "Farmer"} 👋</span>
                  </h1>

                  <p>
                    Manage your crops, connect with buyers and grow
                    your agricultural business from one place.
                  </p>

                  <button
                    className="hero-add-button"
                    onClick={() => setShowAddCrop(true)}
                  >
                    <span>＋</span>
                    List New Crop
                  </button>
                </div>

                <div className="dashboard-hero-visual">
                  <div className="hero-sun"></div>
                  <div className="hero-field field-one"></div>
                  <div className="hero-field field-two"></div>
                  <div className="hero-field field-three"></div>
                  <div className="hero-plant plant-one">🌾</div>
                  <div className="hero-plant plant-two">🌱</div>
                  <div className="hero-plant plant-three">🌿</div>

                  <div className="hero-floating-card">
                    <span>🌾</span>
                    <div>
                      <strong>{crops.length}</strong>
                      <small>Active Listings</small>
                    </div>
                  </div>
                </div>
              </section>

              {/* STATISTICS */}
              <section className="dashboard-stats">
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon green">🌾</div>
                  <div className="dashboard-stat-info">
                    <span>My Listings</span>
                    <strong>{crops.length}</strong>
                    <small>Active crop listings</small>
                  </div>
                </div>

                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon blue">⚖️</div>
                  <div className="dashboard-stat-info">
                    <span>Total Quantity</span>
                    <strong>{totalQuantity} kg</strong>
                    <small>Produce available</small>
                  </div>
                </div>

                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon orange">💰</div>
                  <div className="dashboard-stat-info">
                    <span>Estimated Value</span>
                    <strong>
                      ₹{estimatedValue.toLocaleString("en-IN")}
                    </strong>
                    <small>Based on expected prices</small>
                  </div>
                </div>

                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon purple">📦</div>
                  <div className="dashboard-stat-info">
                    <span>Orders</span>
                    <strong>0</strong>
                    <small>Confirmed orders</small>
                  </div>
                </div>
              </section>

              {/* CROP LISTINGS */}
              <section className="dashboard-listings">
                <div className="dashboard-section-header">
                  <div>
                    <span className="section-eyebrow">
                      YOUR PRODUCE
                    </span>
                    <h2>My Crop Listings</h2>
                    <p>
                      Manage the agricultural produce you have
                      listed on AgriConnect.
                    </p>
                  </div>

                  <button
                    className="dashboard-view-all"
                    onClick={() => onNavigate("dashboard")}
                  >
                    View All <span>→</span>
                  </button>
                </div>

                {loading ? (
                  <div className="dashboard-loading">
                    <div className="loading-orbit">🌱</div>
                    <h3>Loading your crops...</h3>
                    <p>Fetching your latest crop listings.</p>
                  </div>
                ) : crops.length === 0 ? (
                  <div className="dashboard-empty">
                    <div className="empty-plant">🌱</div>
                    <h3>No crops listed yet</h3>
                    <p>
                      Start selling directly to buyers by listing
                      your first crop.
                    </p>
                    <button onClick={() => setShowAddCrop(true)}>
                      + List Your First Crop
                    </button>
                  </div>
                ) : (
                  <div className="dashboard-crop-grid">
                    {crops.map((crop) => (
                      <CropCard
                        key={crop.id}
                        crop={crop}
                        onViewDetails={(cropToView) =>
                          setSelectedCrop(cropToView)
                        }
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* QUICK ACTIONS */}
              <section className="quick-actions">
                <div className="quick-action-heading">
                  <span className="section-eyebrow">QUICK ACCESS</span>
                  <h2>Manage Your Farm</h2>
                </div>

                <div className="quick-action-grid">
                  <button
                    className="quick-action-card"
                    onClick={() => setShowAddCrop(true)}
                  >
                    <div className="quick-action-icon green">🌱</div>
                    <div>
                      <strong>Add New Crop</strong>
                      <span>List fresh produce for buyers</span>
                    </div>
                    <b>→</b>
                  </button>

                  <button
                    className="quick-action-card"
                    onClick={() => onNavigate("offers")}
                  >
                    <div className="quick-action-icon blue">💰</div>
                    <div>
                      <strong>View Offers</strong>
                      <span>Check offers from buyers</span>
                    </div>
                    <b>→</b>
                  </button>

                  <button
                    className="quick-action-card"
                    onClick={() => onNavigate("orders")}
                  >
                    <div className="quick-action-icon orange">📦</div>
                    <div>
                      <strong>View Orders</strong>
                      <span>Track your confirmed sales</span>
                    </div>
                    <b>→</b>
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* ADD CROP MODAL */}
      {showAddCrop && (
        <AddCrop
          farmer={farmer}
          onClose={() => setShowAddCrop(false)}
          onCropAdded={(newCrop) => {
            setCrops((currentCrops) => [...currentCrops, newCrop]);
            setShowAddCrop(false);
          }}
        />
      )}
    </div>
  );
}

export default FarmerDashboard;
