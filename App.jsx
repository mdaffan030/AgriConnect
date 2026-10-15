
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import FarmerOffers from "./pages/FarmerOffers";
import FarmerOrders from "./pages/FarmerOrders";
import BuyerOrders from "./pages/BuyerOrders";
import MarketInsights from "./pages/MarketInsights";
import LoginTransition from "./components/LoginTransition";
import FarmerSettings from "./pages/FarmerSettings";
function App() {
  const [currentHash, setCurrentHash] = useState(
    window.location.hash
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [showLoginTransition, setShowLoginTransition] =
    useState(false);

  const [farmerPage, setFarmerPage] = useState("dashboard");
  const [buyerPage, setBuyerPage] = useState("marketplace");

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (currentHash === "#offers") {
      setFarmerPage("offers");
    } else if (currentHash === "#orders") {
      setFarmerPage("orders");
   
    } else if (currentHash === "#insights") {
       setFarmerPage("insights");
    } else if (currentHash === "#settings") {
  setFarmerPage("settings");
} else {
  setFarmerPage("dashboard");
}


    setBuyerPage(
      currentHash === "#buyer-orders" ? "orders" : "marketplace"
    );
  }, [currentHash]);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.removeItem("agriconnectSelectedRole");

    setUser(userData);
    setShowLoginTransition(true);
    setTimeout(() => {
  setShowLoginTransition(false);
}, 1800);

    if (userData.userType === "farmer") {
      setFarmerPage("dashboard");
      window.location.hash = "dashboard";
    } else {
      setBuyerPage("marketplace");
      window.location.hash = "marketplace";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("agriconnectSelectedRole");

    setUser(null);
    setShowLoginTransition(false);
    window.location.hash = "login";
  };

  const handleNavigation = (page) => {
    window.location.hash = page;
  };

  // Show login when no user is authenticated.
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Show the transition after successful login.
  if (showLoginTransition) {
    return <LoginTransition userType={user.userType} />;
  }

  // Buyer pages.
  if (user.userType === "buyer") {
    if (buyerPage === "orders") {
      return (
        <BuyerOrders
          buyer={user}
          onLogout={handleLogout}
          onNavigate={handleNavigation}
        />
      );
    }

    return (
      <BuyerDashboard
        buyer={user}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      />
    );
  }
if (farmerPage === "settings") {
  return <FarmerSettings farmer={user} />;
}
  // Farmer pages.
  if (farmerPage === "offers") {
    return (
      <FarmerOffers
        farmer={user}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      />
    );
  }

  if (farmerPage === "orders") {
    return (
      <FarmerOrders
        farmer={user}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      />
    );
  }

  if (farmerPage === "insights") {
    return (
      <MarketInsights
        farmer={user}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      />
    );
  }

  return (
    <FarmerDashboard
      farmer={user}
      onLogout={handleLogout}
      onNavigate={handleNavigation}
    />
  );
}

export default App;
