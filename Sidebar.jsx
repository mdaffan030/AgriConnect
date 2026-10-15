function Sidebar({ farmer, onLogout, onNavigate }) {
  return (
    <aside className="sidebar">

      <div className="logo">
        <span>🌾</span>
        <span>AgriConnect</span>
      </div>

      <nav>

        <button
          className="nav-item active"
          onClick={() => onNavigate("dashboard")}
        >
          🏠
          <span>Dashboard</span>
        </button>

        <button
          className="nav-item"
          onClick={() => onNavigate("dashboard")}
        >
          🌾
          <span>My Crops</span>
        </button>

        <button
          className="nav-item"
          onClick={() => onNavigate("offers")}
        >
          💰
          <span>Offers</span>
        </button>

       <button
  className="nav-item"
  onClick={() => onNavigate("orders")}
>
  📦
  <span>Orders</span>
</button>

       <button
  className="nav-item"
  onClick={() => onNavigate("insights")}
>
  📊
  <span>Market Insights</span>
</button>

       
<button
  className="nav-item"
  onClick={() => onNavigate("settings")}
>
  ⚙️
  <span>Settings</span>
</button>


      </nav>

      <div className="sidebar-bottom">

        <div className="farmer-mini">

          <div className="farmer-avatar">
            👨‍🌾
          </div>

          <div>
            <strong>
              {farmer?.name || "Farmer"}
            </strong>

            <small>
              AgriConnect User
            </small>
          </div>

        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          🚪 Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;