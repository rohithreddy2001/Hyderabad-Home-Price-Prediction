// src/components/FormPanel.jsx
import React, { useEffect, useState } from 'react';
import SearchableSelect from './SearchableSelect';
import Spinner from './Spinner';

import {
  IconPin,
  IconApartment,
  IconHouse,
  IconVilla,
  IconArea,
  IconBed
} from './icons';

import { fetchLists, predictPrice } from '../api';

export default function FormPanel({ onResult }) {
  const [locations, setLocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const [locality, setLocality] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [area, setArea] = useState(1200);
  const [age, setAge] = useState(5);
  const [bedrooms, setBedrooms] = useState(2);

  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [err, setErr] = useState('');

  const PROPERTY_ICON_MAP = {
    Apartment: <IconApartment />,
    House: <IconHouse />,
    Villa: <IconVilla />
  };

  useEffect(() => {
    let mounted = true;
    setLoadingLists(true);

    fetchLists()
      .then(({ locations, property_types }) => {
        if (!mounted) return;

        setLocations((locations || []).map(capitalizeWords));
        setPropertyTypes((property_types || []).map(capitalizeWords));
        setLoadingLists(false);
      })
      .catch((err) => {
        console.error('Failed to load lists', err);
        if (mounted) {
          setLocations([]);
          setPropertyTypes([]);
          setLoadingLists(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function capitalizeWords(str) {
    if (!str) return '';
    return str
      .toString()
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  async function handlePredict(e) {
    e.preventDefault();
    setErr('');

    if (!locality || !propertyType) {
      setErr('Please choose locality and property type');
      return;
    }

    setLoadingPredict(true);

    try {
      const json = await predictPrice({
        locality,
        property_type: propertyType,
        area_in_sqft: area,
        age_of_property: age,
        bedrooms,
      });

      const estimated = json.estimated_price ?? 0;
      const low = (estimated * 0.92).toFixed(2);
      const high = (estimated * 1.08).toFixed(2);

      const contributions = [
        { name: 'Locality', value: 45 },
        { name: 'Area', value: 30 },
        { name: 'Bedrooms', value: 15 },
        { name: 'Age', value: 10 },
      ];

      const report = {
        locality,
        property_type: propertyType,
        area_in_sqft: Number(area),
        age_of_property: Number(age),
        bedrooms: Number(bedrooms),
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

      onResult(report);
    } catch (err) {
      console.error(err);
      setErr(err.message || 'Prediction error');
    } finally {
      setLoadingPredict(false);
    }
  }

  return (
    <form className="panel" onSubmit={handlePredict} aria-labelledby="form-title">
      <div id="form-title" className="form-title">Property Details</div>
      <div className="help">Enter property information to get price prediction</div>

      {/* ------------------------ LOCALITY ------------------------ */}
      {loadingLists && locations.length === 0 ? (
        <div className="skel" style={{ height: 44, marginBottom: 12 }} />
      ) : (
        <div style={{ position: 'relative' }}>
          <SearchableSelect
            id="locality"
            label="Locality"
            options={locations}
            value={locality}
            onChange={setLocality}
            placeholder={loadingLists ? 'Loading locations…' : 'Select locality...'}
            leadingIcon={<IconPin />}
          />

          {loadingLists && (
            <div style={{ position: 'absolute', right: 12, top: 36, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Spinner size={14} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>loading</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------ PROPERTY TYPE ------------------------ */}
      {loadingLists && propertyTypes.length === 0 ? (
        <div className="skel" style={{ height: 44, marginBottom: 12 }} />
      ) : (
        <div style={{ position: 'relative' }}>
          <SearchableSelect
            id="propertyType"
            label="Property Type"
            options={propertyTypes}
            value={propertyType}
            onChange={setPropertyType}
            placeholder={loadingLists ? 'Loading types…' : 'Select property type...'}
            leadingIcon={PROPERTY_ICON_MAP[propertyType] ?? <IconApartment />}
            optionIcons={PROPERTY_ICON_MAP}
          />

          {loadingLists && (
            <div style={{ position: 'absolute', right: 12, top: 36, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Spinner size={14} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>loading</span>
            </div>
          )}
        </div>
      )}

      {/* ------------------------ AREA ------------------------ */}
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
            onChange={(e) => setArea(Number(e.target.value))}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          Built-up area of the property
        </div>
      </div>

      {/* ------------------------ AGE ------------------------ */}
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
            onChange={(e) => setAge(Number(e.target.value))}
          />
          <input
            aria-label="Age value"
            className="age-number input"
            type="number"
            min="0"
            max="50"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          Age of the property since construction
        </div>
      </div>

      {/* ------------------------ BEDROOMS ------------------------ */}
      <div className="field">
        <label className="label">Bedrooms</label>

        <div className="bedrooms-row" role="group" aria-label="Bedrooms">
          <button
            type="button"
            className="step-btn"
            aria-label="Decrease bedrooms"
            onClick={() => setBedrooms((b) => Math.max(0, b - 1))}
          >
            −
          </button>

          <div className="bed-chip" role="status" aria-live="polite" tabIndex={0} title={`${bedrooms} Bedrooms`}>
            <span className="bed-icon" aria-hidden><IconBed /></span>
            <span className="bed-text">
              <strong style={{ marginRight: 6 }}>{bedrooms}</strong>Bedrooms
            </span>
          </div>

          <button
            type="button"
            className="step-btn"
            aria-label="Increase bedrooms"
            onClick={() => setBedrooms((b) => b + 1)}
          >
            +
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          Number of bedrooms in the property
        </div>
      </div>

      {err && <div className="error" role="alert">{err}</div>}

      <button className="btn-primary" type="submit" disabled={loadingPredict}>
        {loadingPredict ? 'Estimating...' : 'Get Estimated Price'}
      </button>
    </form>
  );
}
