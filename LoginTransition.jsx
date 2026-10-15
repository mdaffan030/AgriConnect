function LoginTransition({ userType }) {
  return (
    <div className="login-transition">

      <div className="transition-glow"></div>

      <div className="transition-crop crop-left">🌾</div>
      <div className="transition-crop crop-right">🌱</div>

      <div className="transition-content">

        <div className="transition-logo">
          🌿
        </div>

        <p className="transition-eyebrow">
          AGRICONNECT
        </p>

        <h1>
          From Farm
          <span>To You.</span>
        </h1>

        <div className="transition-line"></div>

        <p className="transition-message">
          {userType === "farmer"
            ? "Preparing your farmer dashboard..."
            : "Finding fresh produce for you..."}
        </p>

        <div className="transition-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>

      <div className="transition-bottom">
        🌱 Connecting farmers & buyers directly
      </div>

    </div>
  );
}

export default LoginTransition;