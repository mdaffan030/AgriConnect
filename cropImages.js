
const defaultCropImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";

const cropImages = {
  tomato:
    "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80",
  carrot:
    "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=800&q=80",
  onion:
    "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80",
  potato:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
  corn:
    "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
  wheat:
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",

  // Add more crop-specific images here as needed.
};

const aliases = {
  tomatoes: "tomato",
  "fresh tomato": "tomato",
  carrots: "carrot",
  onions: "onion",
  potatoes: "potato",
  maize: "corn",
  "sweet corn": "corn",
  "wheat grain": "wheat",
};

export function getCropImage(cropName) {
  const name = String(cropName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const normalizedName = aliases[name] || name;

  return cropImages[normalizedName] || defaultCropImage;
}
