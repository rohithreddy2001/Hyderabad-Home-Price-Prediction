// src/components/FormPanel.jsx
import React, { useEffect, useState } from 'react';
import SearchableSelect from './SearchableSelect';
import {
  IconPin,
  IconApartment,
  IconHouse,
  IconVilla,
  IconArea,
  IconBed
} from './icons';
import { fetchLocations, fetchPropertyTypes, predictPrice } from '../api';

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}


export default function FormPanel({ onResult }) {
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [area, setArea] = useState();
  const [age, setAge] = useState(0);
  const [bedrooms, setBedrooms] = useState(2);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // mapping for property icons
  const PROPERTY_ICON_MAP = {
    Apartment: <IconApartment />,
    House: <IconHouse />,
    Villa: <IconVilla />
  };

  useEffect(() => {
    fetchLocations()
      .then(list => setLocations(list.map(capitalizeWords)))
      .catch(console.error);

    fetchPropertyTypes()
      .then(list => setPropertyTypes(list.map(capitalizeWords)))
      .catch(console.error);
  }, []);

  async function handlePredict(e) {
    e.preventDefault();
    setErr('');
    if (!locality || !propertyType) {
      setErr('Please choose locality and property type');
      return;
    }

    setLoading(true);
    try {
      const json = await predictPrice({
        locality,
        property_type: propertyType,
        area_in_sqft: area,
        age_of_property: age,
        bedrooms
      });

      const estimated = json.estimated_price ?? 0;
      const low = (estimated * 0.92).toFixed(2);
      const high = (estimated * 1.08).toFixed(2);

      const contributions = [
        { name: 'Locality', value: 45 },
        { name: 'Area', value: 30 },
        { name: 'Bedrooms', value: 15 },
        { name: 'Age', value: 10 }
      ];

      // Build the full report object including inputs
      const report = {
        // inputs
        locality,
        property_type: propertyType,
        area_in_sqft: Number(area),
        age_of_property: Number(age),
        bedrooms: Number(bedrooms),
        // predictions
        estimated,
        low,
        high,
        contributions,
        timeseries: [
          Number((estimated * 0.95).toFixed(2)),
          Number((estimated * 0.98).toFixed(2)),
          Number(estimated),
          Number((estimated * 1.02).toFixed(2)),
          Number((estimated * 1.05).toFixed(2))
        ]
      };

      // pass whole report back to parent
      onResult(report);
    } catch (err) {
      console.error(err);
      setErr(err.message || 'Prediction error');
    } finally {
      setLoading(false);
    }
  }

  // keyboard handlers for +/- keys on chip (optional)
  function handleKeyOnChip(e) {
    if (e.key === 'ArrowUp' || e.key === '+') {
      setBedrooms(b => b + 1);
    } else if (e.key === 'ArrowDown' || e.key === '-') {
      setBedrooms(b => Math.max(0, b - 1));
    }
  }

  return (
    <form className="panel" onSubmit={handlePredict} aria-labelledby="form-title">
      <div id="form-title" className="form-title">Property Details</div>
      <div className="help">Enter property information to get price prediction</div>

      {/* Locality */}
      <SearchableSelect
        id="locality"
        label="Locality"
        options={locations}
        value={locality}
        onChange={setLocality}
        placeholder="Select locality..."
        leadingIcon={<IconPin />}
      />

      {/* Property Type */}
      <SearchableSelect
        id="propertyType"
        label="Property Type"
        options={propertyTypes}
        value={propertyType}
        onChange={setPropertyType}
        placeholder="Select property type..."
        leadingIcon={PROPERTY_ICON_MAP[propertyType] ?? <IconApartment />}
        optionIcons={PROPERTY_ICON_MAP}
      />

      {/* Area */}
      <div className="field" style={{ position: 'relative' }}>
        <label className="label">Area (sq ft)</label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <IconArea />
          </div>
          <input
            aria-label="Area in square feet"
            className="input"
            type="number"
            min="100"
            value={area}
            onChange={e => setArea(Number(e.target.value))}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Built-up area of the property</div>
      </div>

      {/* Age */}
      <div className="field">
        <label className="label">Property Age (years)</label>
        <div className="slider-row">
          <input
            aria-label="Age of property"
            type="range"
            className="range"
            min="0"
            max="50"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
          />
          <input
            aria-label="Age value"
            className="age-number input"
            type="number"
            min="0"
            max="50"
            value={age}
            onChange={e => setAge(Number(e.target.value))}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Age of the property since construction</div>
      </div>

      {/* Bedrooms - Figma style */}
      <div className="field">
        <label className="label">Bedrooms</label>

        <div
          className="bedrooms-row"
          role="group"
          aria-label="Bedrooms"
          onKeyDown={handleKeyOnChip}
        >
          {/* minus button */}
          <button
            type="button"
            className="step-btn"
            aria-label="Decrease bedrooms"
            onClick={() => setBedrooms(b => Math.max(0, b - 1))}
          >
            <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>−</span>
          </button>

          {/* center chip */}
          <div
            className="bed-chip"
            role="status"
            aria-live="polite"
            tabIndex={0}
            title={`${bedrooms} Bedrooms`}
          >
            <span className="bed-icon" aria-hidden><IconBed /></span>
            <span className="bed-text"><strong style={{marginRight:6}}>{bedrooms}</strong>Bedrooms</span>
          </div>

          {/* plus button */}
          <button
            type="button"
            className="step-btn"
            aria-label="Increase bedrooms"
            onClick={() => setBedrooms(b => b + 1)}
          >
            <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Number of bedrooms in the property</div>
      </div>

      {err && <div className="error" role="alert">{err}</div>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Predicting...' : 'Get Estimated Price (₹)'}
      </button>
    </form>
  );
}
