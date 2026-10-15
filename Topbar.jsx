function Topbar({ farmer }) {
  return (
    <header className="topbar">

      <div>
        <span className="mobile-title">AgriConnect</span>
      </div>

      <div className="topbar-right">

        <button className="notification">
          🔔
          <span></span>
        </button>

        <div className="profile">
          <div className="profile-avatar">
            👨‍🌾
          </div>

          <div className="profile-info">
           <strong>{farmer?.name || "Farmer"}</strong>
            <small>Farmer Account</small>
          </div>
        </div>

      </div>

    </header>
  );
}

export default Topbar;