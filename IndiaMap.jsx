
import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const INDIA_GEO_URL =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson";
const STATE_ALIASES = {
  "Andaman and Nicobar Islands": "Andaman and Nicobar Islands",
  "Andhra Pradesh": "Andhra Pradesh",
  "Arunachal Pradesh": "Arunachal Pradesh",
  "Assam": "Assam",
  "Bihar": "Bihar",
  "Chandigarh": "Chandigarh",
  "Chhattisgarh": "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu":
    "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi": "Delhi",
  "Goa": "Goa",
  "Gujarat": "Gujarat",
  "Haryana": "Haryana",
  "Himachal Pradesh": "Himachal Pradesh",
  "Jammu and Kashmir": "Jammu and Kashmir",
  "Jharkhand": "Jharkhand",
  "Karnataka": "Karnataka",
  "Kerala": "Kerala",
  "Ladakh": "Ladakh",
  "Lakshadweep": "Lakshadweep",
  "Madhya Pradesh": "Madhya Pradesh",
  "Maharashtra": "Maharashtra",
  "Manipur": "Manipur",
  "Meghalaya": "Meghalaya",
  "Mizoram": "Mizoram",
  "Nagaland": "Nagaland",
  "Odisha": "Odisha",
  "Punjab": "Punjab",
  "Rajasthan": "Rajasthan",
  "Sikkim": "Sikkim",
  "Tamil Nadu": "Tamil Nadu",
  "Telangana": "Telangana",
  "Tripura": "Tripura",
  "Uttar Pradesh": "Uttar Pradesh",
  "Uttarakhand": "Uttarakhand",
  "West Bengal": "West Bengal",
};


function getStateName(geo) {
  const props = geo.properties || {};
  return props.NAME_1 || props.st_nm || props.ST_NM || props.name || "";
}


export default function IndiaMap({
  selectedState = "Telangana",
  onStateSelect,
}) {
  const [mapError, setMapError] = useState(false);

  return (
    <section className="india-map-card">
      <div className="india-map-heading">
        <div>
          <span className="india-map-eyebrow">MARKET EXPLORER</span>
          <h3>Explore India</h3>
          <p>Choose a state to explore its market prices.</p>
        </div>
        <span className="india-map-selected">
          {selectedState || "Select a state"}
        </span>
      </div>

      {mapError ? (
        <div className="india-map-error">
          The map could not load. Check your internet connection and refresh.
        </div>
      ) : (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [82.8, 23.5],
            scale: 650,
          }}
          width={600}
          height={520}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup center={[82.8, 23.5]} zoom={1}>
            <Geographies geography={INDIA_GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                 const stateName = getStateName(geo);

const normalize = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, " ");

const isSelected =
  normalize(stateName) === normalize(selectedState);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (stateName && onStateSelect) {
                          onStateSelect(
                            STATE_ALIASES[stateName] || stateName
                          );
                        }
                      }}
                      
style={{
  default: {
    fill: isSelected ? "#22C55E" : "#DDEBDD",
    stroke: isSelected ? "#14532D" : "#FFFFFF",
    strokeWidth: isSelected ? 2 : 0.8,
    outline: "none",
    fillOpacity:1,
  },
  hover: {
    fill: "#86EFAC",
    stroke: "#14532D",
    strokeWidth: 1.5,
    outline: "none",
    cursor: "pointer",
     fillOpacity:1,
  },
  pressed: {
    fill: "#15803D",
    stroke: "#14532D",
    strokeWidth: 2,
    outline: "none",
     fillOpacity:1,
  },
}}

                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      )}
    </section>
  );
}
