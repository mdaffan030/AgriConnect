import { useEffect, useMemo, useState } from "react";

import IndiaMap from "../components/IndiaMap";


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FALLBACK_STATES = [
  "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka",
  "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
];

const FALLBACK_COMMODITIES = [
  "Tomato", "Onion", "Potato", "Rice", "Wheat", "Maize", "Cotton",
  "Chilli", "Brinjal", "Cabbage", "Cauliflower", "Green Gram",
  "Red Gram", "Groundnut", "Turmeric",
];

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

function MarketInsights({ farmer }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedState, setSelectedState] = useState("Telangana");
  const [selectedCrop, setSelectedCrop] = useState("All crops");
  const [selectedMarketCrop, setSelectedMarketCrop] = useState("Tomato");
  const [selectedPeriod, setSelectedPeriod] = useState("365");
  const [marketPrices, setMarketPrices] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [marketStates, setMarketStates] = useState(FALLBACK_STATES);
  const [marketCropOptions, setMarketCropOptions] = useState(FALLBACK_COMMODITIES);
  const [metadataStatus, setMetadataStatus] = useState("Loading available states and commodities…");

  useEffect(() => {
    const controller = new AbortController();

    async function loadMarketMetadata() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/market-metadata",
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Could not load CEDA market options.");
        }

        if (Array.isArray(data.states) && data.states.length > 0) {
          setMarketStates(data.states);
          setMetadataStatus(`${data.states.length} states/regions available from CEDA`);
          setSelectedState((current) =>
            current === "All India" || data.states.includes(current)
              ? current
              : (data.states.includes("Telangana") ? "Telangana" : data.states[0])
          );
        }

        if (Array.isArray(data.commodities) && data.commodities.length > 0) {
          setMarketCropOptions(data.commodities);
          setSelectedMarketCrop((current) =>
            data.commodities.includes(current) ? current : data.commodities[0]
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("CEDA metadata request failed:", err);
          setMetadataStatus("Using fallback options; CEDA metadata could not be loaded.");
        }
      }
    }

    loadMarketMetadata();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!farmer?.id) {
      setError("Farmer account information is unavailable.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadInsights() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/market-insights?farmer_id=${farmer.id}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Could not load your AgriConnect analytics.");
        }

        const data = await response.json();
        setInsights(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Market insights error:", err);
          setError(err.message || "Unable to load market insights.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadInsights();
    return () => controller.abort();
  }, [farmer?.id]);

  const cropBreakdown = useMemo(
    () => insights?.crop_breakdown || [],
    [insights]
  );

  const cropOptions = useMemo(
    () => [
      "All crops",
      ...new Set(cropBreakdown.map((crop) => crop.crop_name)),
    ],
    [cropBreakdown]
  );

  const filteredCrops = useMemo(
    () =>
      selectedCrop === "All crops"
        ? cropBreakdown
        : cropBreakdown.filter(
            (crop) => crop.crop_name === selectedCrop
          ),
    [cropBreakdown, selectedCrop]
  );

  useEffect(() => {
    if (selectedState === "All India") {
      setMarketPrices(null);
      setMarketError("Choose a specific state to retrieve its reported mandi prices.");
      setMarketLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadMarketPrices() {
      setMarketLoading(true);
      setMarketError("");
      setMarketPrices(null);

      try {
        const params = new URLSearchParams({
          state: selectedState,
          commodity: selectedMarketCrop,
          days: selectedPeriod,
        });
        const response = await fetch(
          `http://127.0.0.1:8000/api/market-prices?${params.toString()}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Could not load mandi prices.");
        }

        setMarketPrices(data);
        if (!data.records || data.records.length === 0) {
          setMarketError("No records were returned for this crop and state in the selected period.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Market price request failed:", err);
          setMarketError(err.message || "Unable to load mandi prices.");
        }
      } finally {
        if (!controller.signal.aborted) setMarketLoading(false);
      }
    }

    loadMarketPrices();
    return () => controller.abort();
  }, [selectedState, selectedMarketCrop, selectedPeriod]);

  if (loading) {
    return (
      <main className="market-insights-page">
        <div className="insights-loading">
          <div className="insights-loading-icon">🌱</div>
          <h3>Preparing your market dashboard</h3>
          <p>Loading your crop, offer and sales analytics…</p>
        </div>
      </main>
    );
  }

  if (error || !insights) {
    return (
      <main className="market-insights-page">
        <div className="insights-empty">
          <div>📊</div>
          <h3>Market insights are unavailable</h3>
          <p>{error || "No analytics data was returned."}</p>
          <button
            className="insights-action-button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const summary = insights.summary || {};

  const statCards = [
    {
      icon: "🌾",
      label: "Listed crops",
      value: formatNumber(summary.total_crops),
      tone: "green",
    },
    {
      icon: "⚖️",
      label: "Available quantity",
      value: `${formatNumber(summary.total_quantity)} kg`,
      tone: "blue",
    },
    {
      icon: "₹",
      label: "Average asking price",
      value: `₹${formatNumber(summary.average_price)}/kg`,
      tone: "orange",
    },
    {
      icon: "💰",
      label: "Total sales",
      value: `₹${formatNumber(summary.total_sales)}`,
      tone: "purple",
    },
  ];

  return (
    <main className="market-insights-page">
      {/* Dashboard heading */}
      <section className="insights-header">
        <div className="insights-header-copy">
          <span className="insights-eyebrow">
            AGRICONNECT INTELLIGENCE
          </span>
          <h1>Market Insights</h1>
          <p>
            Understand your farm performance and explore the Indian
            agricultural market in one place.
          </p>
          <div className="insights-header-tags">
            <span>🇮🇳 India-focused</span>
            <span>📊 Farm analytics</span>
            <span>🌱 Crop intelligence</span>
          </div>
        </div>
        <div className="insights-header-icon" aria-hidden="true">
          <span>₹</span>
          <span>↗</span>
        </div>
      </section>

      {/* Your marketplace statistics */}
      <section className="insights-section">
        <div className="insights-section-heading">
          <div>
            <span className="insights-eyebrow">YOUR BUSINESS</span>
            <h2>Farm performance</h2>
          </div>
          <span className="insights-data-label">AgriConnect data</span>
        </div>

        <div className="insights-stats">
          {statCards.map((stat) => (
            <article className="insight-stat-card" key={stat.label}>
              <div className={`insight-stat-icon ${stat.tone}`}>
                {stat.icon}
              </div>
              <div className="insight-stat-copy">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className="insights-secondary">
          <article className="secondary-card">
            <span>Buyer offers</span>
            <strong>{formatNumber(summary.total_offers)}</strong>
            <small>Total offers received</small>
          </article>
          <article className="secondary-card">
            <span>Accepted offers</span>
            <strong>{formatNumber(summary.accepted_offers)}</strong>
            <small>Offers accepted</small>
          </article>
          <article className="secondary-card">
            <span>Pending offers</span>
            <strong>{formatNumber(summary.pending_offers)}</strong>
            <small>Awaiting response</small>
          </article>
          <article className="secondary-card">
            <span>Total orders</span>
            <strong>{formatNumber(summary.total_orders)}</strong>
            <small>Recorded orders</small>
          </article>
        </div>
      </section>

      {/* India market exploration */}
      <section className="insights-section">
        <div className="insights-section-heading">
          <div>
            <span className="insights-eyebrow">INDIAN AGRICULTURE</span>
            <h2>Explore the market</h2>
            <p>
              Choose a region and crop to prepare your market view.
            </p>
          </div>
          <span className="market-status-badge">
            CEDA Agmarknet connected
          </span>
        </div>

        <div className="market-explorer-grid">
          <article className="insights-card india-explorer-card">
            <div className="insights-card-header">
              <div>
                <span>REGIONAL EXPLORER</span>
                <h3>Markets across India</h3>
              </div>
              <div className="chart-icon">🇮🇳</div>
            </div>

           
<div className="india-map-placeholder">
  <IndiaMap
    selectedState={selectedState}
   
onStateSelect={(state) => {
  if (marketStates.includes(state)) {
    setSelectedState(state);
  }
}}

  />

  <label htmlFor="market-state">Select state or region</label>
  <select
    id="market-state"
    value={selectedState}
    onChange={(event) => setSelectedState(event.target.value)}
  >
    <option value="All India">All India</option>
    {marketStates.map((state) => (
      <option key={state} value={state}>
        {state}
      </option>
    ))}
  </select>

  <div className="selected-region">
    <span>Selected region</span>
    <strong>{selectedState}</strong>
  </div>

  <p className="market-metadata-status">{metadataStatus}</p>
</div>

          </article>

          <article className="insights-card mandi-preview-card">
            <div className="insights-card-header">
              <div>
                <span>WHOLESALE MARKET</span>
                <h3>Mandi price explorer</h3>
              </div>
              <div className="chart-icon">₹</div>
            </div>

            <label className="market-filter-label" htmlFor="market-crop">
              Commodity
            </label>
            <select
              id="market-crop"
              className="market-filter"
              value={selectedMarketCrop}
              onChange={(event) => setSelectedMarketCrop(event.target.value)}
            >
              {marketCropOptions.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
            
<label className="market-filter-label" htmlFor="market-period">
  Time period
</label>
<select
  id="market-period"
  className="market-filter"
  value={selectedPeriod}
  onChange={(event) => setSelectedPeriod(event.target.value)}
>
  <option value="30">Last 30 days</option>
  <option value="90">Last 3 months</option>
  <option value="180">Last 6 months</option>
  <option value="365">Last 1 year</option>
</select>


            {marketLoading ? (
              <div className="market-data-notice">
                <span className="market-notice-icon">↻</span>
                <div>
                  <strong>Loading reported mandi prices…</strong>
                  <p>Checking CEDA Agmarknet records for {selectedMarketCrop} in {selectedState}.</p>
                </div>
              </div>
            ) : marketError ? (
              <div className="market-data-notice">
                <span className="market-notice-icon">ⓘ</span>
                <div>
                  <strong>{marketError.startsWith("No records") ? "No matching market records" : "Market data unavailable"}</strong>
                  <p>{marketError}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="market-data-notice">
                  <span className="market-notice-icon">↗</span>
                  <div>
                    <strong>{marketPrices?.record_count || 0} historical records found</strong>
                    <p>
                      Reporting dates: {marketPrices?.records?.[0]?.t || "—"} to {marketPrices?.records?.[Math.max(0, (marketPrices?.records?.length || 1) - 1)]?.t || "—"}.
                      These are historical records, not live prices.
                    </p>
                  </div>
                </div>

                <div className="market-price-list">
                  {(marketPrices?.records || []).slice(-6).reverse().map((record, index) => (
                    <div
                      className="market-price-row"
                      key={`${record.t}-${index}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 0",
                        borderBottom: "1px solid #e8eee8",
                      }}
                    >
                      
<div className="market-price-list">
  {(marketPrices?.records || []).map((record, index) => {
    const dateColumns = (marketPrices?.columns || []).filter(
      (column) =>
        /^\d{4}-\d{2}-\d{2}$/.test(column.key) &&
        record[column.key] !== "NR" &&
        record[column.key] !== null &&
        record[column.key] !== undefined &&
        record[column.key] !== "" &&
        Number.isFinite(Number(record[column.key]))
    );

    const latest = dateColumns.sort((a, b) =>
      b.key.localeCompare(a.key)
    )[0];

    const price = latest ? Number(record[latest.key]) : null;

    return (
      <div
        key={`${record.variety || "crop"}-${index}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "12px 0",
          borderBottom: "1px solid #e8eee8",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            minWidth: 0,
          }}
        >
          <strong>{latest?.key || "No reported date"}</strong>
          <span>
            {record.variety || selectedMarketCrop} ·{" "}
            {marketPrices?.market || selectedState}
          </span>
        </div>

        <div
          className="market-price-values"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "5px",
            flexShrink: 0,
          }}
        >
          <strong>
            {price !== null
              ? `₹${formatNumber(price)}`
              : "No price reported"}
          </strong>
          <span>
            {price !== null
              ? marketPrices?.price_unit || "Price unit reported by source"
              : "No report for available dates"}
          </span>
        </div>
      </div>
    );
  })}
</div>

                      

</div>

                  ))}
                </div>
                
<div style={{ width: "100%", height: 300, marginTop: 24 }}>
  <h3>Historical Market Price Trend</h3>

  {(marketPrices?.records || []).length === 0 ? (
    <p>No historical prices available to graph.</p>
  ) : (
    <ResponsiveContainer width="100%" height="85%">
     
<LineChart
  data={(marketPrices?.records || [])
    .flatMap((record) =>
      (marketPrices?.columns || [])
        .filter(
          (column) =>
            /^\d{4}-\d{2}-\d{2}$/.test(column.key) &&
            record[column.key] !== "NR" &&
            record[column.key] !== null &&
            record[column.key] !== undefined &&
            record[column.key] !== ""
        )
        .map((column) => ({
          date: column.key,
          price: Number(record[column.key]),
          variety: record.variety,
        }))
    )
    .filter((item) => Number.isFinite(item.price))
    .sort((a, b) => a.date.localeCompare(b.date))}
  margin={{ top: 10, right: 15, left: 5, bottom: 25 }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis
    dataKey="date"
    tick={{ fontSize: 11 }}
    angle={-25}
    textAnchor="end"
    interval="preserveStartEnd"
  />
  <YAxis
    tick={{ fontSize: 11 }}
    tickFormatter={(value) => `₹${formatNumber(value)}`}
  />
  <Tooltip
    labelFormatter={(label) => `Date: ${label}`}
    formatter={(value) => [
      `₹${formatNumber(value)}`,
      "Price (₹/quintal)",
    ]}
  />
  <Line
    type="monotone"
    dataKey="price"
    name="Reported price"
    stroke="#28734a"
    strokeWidth={2.5}
    dot={{ r: 4 }}
    activeDot={{ r: 5 }}
  />
</LineChart>

    </ResponsiveContainer>
  )}
</div>

              </>
            )}

            <div className="market-source-row">
              <div>
                <span>Data source</span>
                <strong>Agmarknet</strong>
              </div>
              <a href={marketPrices?.source_url || "https://api.agmarknet.gov.in/"} target="_blank" rel="noreferrer">
                View source ↗
              </a>
            </div>

            <p className="market-source-footnote">
              Prices are shown with source reporting dates. The price unit has not yet been independently verified; do not compare these values directly with your asking price per kg.
            </p>
          </article>
        </div>
      </section>

      {/* Existing price chart and crop breakdown */}
      <section className="insights-grid">
        <article className="insights-card chart-card">
          <div className="insights-card-header">
            <div>
              <span>YOUR LISTINGS</span>
              <h2>Expected price by crop</h2>
            </div>
            <div className="chart-icon">₹</div>
          </div>

          {filteredCrops.length === 0 ? (
            <div className="chart-empty">
              No crop data matches your selection.
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={filteredCrops}
                  margin={{ top: 12, right: 12, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8eee8"
                  />
                  <XAxis
                    dataKey="crop_name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${formatNumber(value)}/kg`,
                      "Expected price",
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e4ebe4",
                    }}
                  />
                  <Bar
                    dataKey="expected_price"
                    name="Expected price"
                    fill="#28734a"
                    radius={[7, 7, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="chart-disclaimer">
            These are your listed asking prices, not verified mandi rates.
          </p>
        </article>

        <article className="insights-card">
          <div className="insights-card-header">
            <div>
              <span>YOUR PRODUCE</span>
              <h2>Crop availability</h2>
            </div>
            <div className="chart-icon">🌾</div>
          </div>

          <div className="crop-insight-list">
            {filteredCrops.length === 0 ? (
              <div className="chart-empty">No crops listed yet.</div>
            ) : (
              filteredCrops.map((crop, index) => {
                const quantity = Number(crop.quantity) || 0;
                const maximumQuantity = Math.max(
                  ...filteredCrops.map(
                    (item) => Number(item.quantity) || 0
                  ),
                  1
                );

                return (
                  <div
                    className="crop-insight-row"
                    key={`${crop.crop_name}-${index}`}
                  >
                    <div className="crop-insight-name">
                      <div className="crop-insight-icon">🌱</div>
                      <div>
                        <strong>{crop.crop_name}</strong>
                        <span>
                          ₹{formatNumber(crop.expected_price)}/kg
                        </span>
                      </div>
                    </div>
                    <div className="crop-insight-quantity">
                      <strong>{formatNumber(quantity)} kg</strong>
                      <div className="quantity-bar">
                        <span
                          style={{
                            width: `${(quantity / maximumQuantity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      {/* AI advisor: honest placeholder until connected */}
      <section className="ai-advisor-card">
        <div className="ai-advisor-heading">
          <div className="ai-advisor-icon">✦</div>
          <div>
            <span className="insights-eyebrow">AGRICULTURAL INTELLIGENCE</span>
            <h2>AI Market Advisor</h2>
            <p>
              A future assistant for understanding price movements,
              weather risks, supply changes and crop demand in India.
            </p>
          </div>
        </div>

        <div className="ai-advisor-grid">
          <div className="ai-advisor-item">
            <span>01</span>
            <strong>Price trends</strong>
            <p>Compare reported mandi prices over time.</p>
          </div>
          <div className="ai-advisor-item">
            <span>02</span>
            <strong>Weather impact</strong>
            <p>Identify relevant weather risks using sourced forecasts.</p>
          </div>
          <div className="ai-advisor-item">
            <span>03</span>
            <strong>Market news</strong>
            <p>Review agricultural news with dates and source links.</p>
          </div>
        </div>

        <div className="ai-advisor-status">
          <span className="status-dot" />
          <p>
            AI analysis is not connected yet. No generated market
            recommendations or live trends are being presented as facts.
          </p>
        </div>
      </section>

      {/* Business summary */}
      <section className="insights-business-card">
        <div>
          <span className="insights-eyebrow">YOUR NEXT OPPORTUNITY</span>
          <h2>Build stronger direct sales</h2>
          <p>
            Keep crop quantities and asking prices updated, review incoming
            offers, and use verified market information when deciding how
            to price your produce.
          </p>
        </div>

        <div className="business-summary">
          <div>
            <span>Expected crop value</span>
            <strong>
              ₹{formatNumber(summary.total_expected_value)}
            </strong>
          </div>
          <div>
            <span>Accepted offers</span>
            <strong>{formatNumber(summary.accepted_offers)}</strong>
          </div>
          <div>
            <span>Total orders</span>
            <strong>{formatNumber(summary.total_orders)}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MarketInsights;
