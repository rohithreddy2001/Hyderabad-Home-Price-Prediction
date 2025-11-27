import React from 'react';
import IconSave from './IconSave';
import IconDownload from './IconDownload';

function MiniChart({data=[]}) {
  const max = Math.max(...data, 1);
  const w = 200, h = 66, step = w / Math.max(1, data.length-1);
  const points = data.map((v,i)=> `${i*step},${h - (v / max)*h}`).join(' ');
  return (
    <svg width="100%" height="72" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline fill="none" stroke="#2F80ED" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatPrice(estimated) {
  if (estimated === null || estimated === undefined) return "-";
  if (estimated < 1) {
    const valueLakhs = estimated * 100;
    const whole = Number(valueLakhs.toFixed(2));
    return (Number.isInteger(whole) ? whole.toFixed(0) : valueLakhs.toFixed(2)) + " Lakhs";
  }
  return Number(estimated).toFixed(2) + " Crores";
}

export default function ResultPanel({ result, onSave, onDownload }) {
  if (!result) {
    return (
      <div className="panel" aria-live="polite">
        <div style={{textAlign:'center',padding:'40px 12px',color:'var(--muted)'}}>
          <div style={{fontSize:28, color: "green", fontWeight: "600"}}> ₹ </div>
          <div style={{fontWeight:600, marginTop:8}}>No Prediction Yet</div>
          <div style={{fontSize:12, marginTop:8}}>Fill in the property details on the left to get an ML-powered price prediction</div>
        </div>
      </div>
    );
  }

  const {
    locality,
    property_type,
    area_in_sqft,
    age_of_property,
    bedrooms,
    estimated,
    low,
    high,
    contributions = [],
    timeseries = []
  } = result;

  const infoRows = [
    { label: 'Locality', value: locality || '-' },
    { label: 'Property Type', value: property_type || '-' },
    { label: 'Area (sq ft)', value: area_in_sqft != null ? String(area_in_sqft) : '-' },
    { label: 'Age (yrs)', value: age_of_property != null ? String(age_of_property) : '-' },
    { label: 'Bedrooms', value: bedrooms != null ? String(bedrooms) : '-' }
  ];

  const reportPayload = result;

  return (
    <div className="panel" aria-live="polite">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontSize:12, color:'var(--muted)'}}>Predicted Price</div>
          <div className="result-price" style={{ color: "green", fontWeight: "500" }}>
            ₹ {formatPrice(estimated)}
          </div>
          <div className="result-sub">Confidence: {low} — {high} crores</div>
        </div>
      </div>

      {/* Selected property info (display inputs) */}
      <div style={{ marginTop: 14, marginBottom: 8, padding: 12, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {infoRows.map(r => (
            <div key={r.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{r.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:8}}>
        <div style={{fontSize:12, color:'var(--muted)'}}>Feature contributions</div>
        <div className="feature-bars">
          {contributions.map(c => (
            <div key={c.name} className="feature" title={`${c.value}%`}>
              <div style={{width:80,fontSize:12,color:'var(--muted)'}}>{c.name}</div>
              <div className="bar" aria-hidden><i style={{width: `${c.value}%`}}/></div>
              <div style={{width:40,textAlign:'right', fontSize:12}}>{c.value}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mini-chart" role="img" aria-label="Mini price trend chart">
        <MiniChart data={timeseries || []} />
      </div>

      <div className="actions" role="toolbar" aria-label="Actions" style={{ marginTop: 12 }}>
        {/* <button className="action-btn" onClick={() => onSave && onSave(reportPayload)}><IconSave/> Save</button> */}
        <button className="action-btn" onClick={() => onDownload && onDownload(reportPayload)}><IconDownload/> Download Report</button>
      </div>
    </div>
  );
}
