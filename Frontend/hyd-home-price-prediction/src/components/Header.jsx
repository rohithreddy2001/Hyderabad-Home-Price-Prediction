import React from "react";
import charminar from "../assets/charminar.png";


export default function Header() {
  return (
    <header className="site-header" role="banner" aria-label="HomePriceAI header">
      <div className="header-inner">

        <div className="brand" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          
          <img
            src={charminar}
            alt="Home Price Predictor Logo"
            style={{
              width: 60,
              height: 60,
              borderRadius: 0,
              objectFit: "fill",
            }}
          />

          <div className="brand-text">
            <div className="app-title">Hyderabad Home Price Estimator</div>
            <div className="app-sub">Machine Learning-Based House Price Valuation</div>
          </div>
        </div>

      </div>
    </header>
  );
}
