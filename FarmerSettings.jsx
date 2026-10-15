
function FarmerSettings({ farmer }) {
  return (
    <div className="dashboard-content">
      <h1>Farmer Settings</h1>
      <p>Manage your account details here.</p>
      <p>Name: {farmer?.name || "Farmer"}</p>
      <p>Email: {farmer?.email || "Not available"}</p>
    </div>
  );
}

export default FarmerSettings;
