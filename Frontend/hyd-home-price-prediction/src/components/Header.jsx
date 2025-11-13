// src/components/Header.jsx
import React from "react";
import charminar from "../assets/charminar.png";

/**
 * Clean top header with:
 * - left: logo image + text (HomePriceAI + subtitle)
 * - no API docs button
 */

export default function Header() {
  return (
    <header className="site-header" role="banner" aria-label="HomePriceAI header">
      <div className="header-inner">

        {/* Left: logo + title */}
        <div className="brand" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          
          {/* Logo Image */}
          <img
            src={charminar}
            alt="HomePriceAI Logo"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              objectFit: "cover",
            }}
          />

          {/* Title text */}
          <div className="brand-text">
            <div className="app-title">Hyderabad Home Price Estimator</div>
            <div className="app-sub">Machine Learning-Based House Price Valuation</div>
          </div>
        </div>

      </div>
    </header>
  );
}
