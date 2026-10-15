const API_URL = "http://127.0.0.1:8000";


// Get crops for a specific farmer
export async function getCrops(farmerId) {

  const response = await fetch(
    `${API_URL}/api/crops?farmer_id=${farmerId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch crops");
  }

  return response.json();
}


// Add a new crop
export async function addCrop(crop) {

  const response = await fetch(`${API_URL}/api/crops`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(crop),
  });

  if (!response.ok) {
    throw new Error("Failed to add crop");
  }

  return response.json();
}
export async function createOffer(offer) {
  const response = await fetch(`${API_URL}/api/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(offer),
  });

  if (!response.ok) {
    throw new Error("Failed to submit offer");
  }

  return response.json();
}