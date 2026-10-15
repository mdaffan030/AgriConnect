
import { useState } from "react";

function Login({ onLogin }) {
  const getInitialRole = () => {
    const selectedRole = localStorage.getItem("agriconnectSelectedRole");

    if (selectedRole === "buyer" || selectedRole === "farmer") {
      return selectedRole;
    }

    return window.location.hash === "#login-buyer" ? "buyer" : "farmer";
  };

  const [userType, setUserType] = useState(getInitialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role) => {
    setUserType(role);
    setMessage("");
    localStorage.setItem("agriconnectSelectedRole", role);
    window.location.hash = `login-${role}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMessage("Logging in...");

    const endpoint =
      userType === "farmer"
        ? "http://127.0.0.1:8000/api/farmers/login"
        : "http://127.0.0.1:8000/api/buyers/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      const successMessage =
        userType === "farmer"
          ? "Login successful!"
          : "Buyer login successful!";

      const loggedInUser =
        userType === "farmer" ? data.farmer : data.buyer;

      if (response.ok && data.message === successMessage && loggedInUser) {
        setMessage(`Welcome, ${loggedInUser.name}!`);

        onLogin?.({
          ...loggedInUser,
          userType,
        });
      } else {
        setMessage(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-sun"></div>
      <div className="login-field field-back"></div>
      <div className="login-field field-middle"></div>
      <div className="login-field field-front"></div>

      <div className="floating-crop crop-1">🌿</div>
      <div className="floating-crop crop-2">🌾</div>
      <div className="floating-crop crop-3">🍃</div>
      <div className="floating-crop crop-4">🌱</div>
      <div className="floating-crop crop-5">🍃</div>
      <div className="floating-crop crop-6">🌾</div>

      <div className="login-overlay"></div>

      <div className="login-brand">
        <div className="brand-icon">🌿</div>
        <div>
          <strong>AgriConnect</strong>
          <span>From Farm → To You</span>
        </div>
      </div>

      <div className="login-top-message">
        Connecting Farmers Directly to Buyers
      </div>

      <div className="login-content">
        <div className="login-intro">
          <div className="intro-eyebrow">
            FRESH HARVESTS · DIRECT TRADE
          </div>

          <h1>
            From Farm
            <br />
            <span>To You.</span>
          </h1>

          <div className="intro-line"></div>

          <p>
            Connecting farmers and buyers directly to create a fresher,
            fairer and smarter agricultural marketplace.
          </p>

          <div className="login-features">
            <div className="login-feature">
              <div>🌱</div>
              <span>
                <strong>Fresh Produce</strong>
                Direct from farms
              </span>
            </div>

            <div className="login-feature">
              <div>🤝</div>
              <span>
                <strong>Direct Trade</strong>
                No unnecessary middlemen
              </span>
            </div>

            <div className="login-feature">
              <div>💰</div>
              <span>
                <strong>Fair Prices</strong>
                Better value for everyone
              </span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-logo">
            {userType === "farmer" ? "🌾" : "🛒"}
          </div>

          <div className="login-card-heading">
            <h2>Welcome back</h2>
            <p>
              {userType === "farmer"
                ? "Manage your farm and connect with buyers."
                : "Discover fresh produce directly from farmers."}
            </p>
          </div>

          <div className="user-type-selector">
            <button
              type="button"
              className={
                userType === "farmer"
                  ? "type-button active"
                  : "type-button"
              }
              onClick={() => handleRoleChange("farmer")}
            >
              <span>🌾</span> Farmer
            </button>

            <button
              type="button"
              className={
                userType === "buyer"
                  ? "type-button active"
                  : "type-button"
              }
              onClick={() => handleRoleChange("buyer")}
            >
              <span>🛒</span> Buyer
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrapper">
                <span>✉️</span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrapper">
                <span>🔒</span>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              className="login-submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting
                  ? "Logging in..."
                  : `Login as ${userType === "farmer" ? "Farmer" : "Buyer"}`}
              </span>
              <span className="login-arrow">→</span>
            </button>
          </form>

          {message && (
            <div
              className={
                message.includes("successful") || message.includes("Welcome")
                  ? "login-message success"
                  : "login-message"
              }
              role="status"
            >
              {message}
            </div>
          )}

          <div className="login-footer">
            <span>🌱</span>
            <p>Support Farmers • Grow Together</p>
          </div>
        </div>
      </div>

      <div className="login-bottom-text">
        🌾 Fresh from the field • 🤝 Direct from farmers
      </div>
    </div>
  );
}

export default Login;
