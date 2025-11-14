// src/api.js
const BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, ''); // remove trailing slash

async function handleFetch(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function fetchLocations() {
  const url = `${BASE}/get_location_names`;
  const res = await fetch(url);
  return handleFetch(res).then(json => json.locations || []);
}

export async function fetchPropertyTypes() {
  const url = `${BASE}/get_property_types`;
  const res = await fetch(url);
  return handleFetch(res).then(json => json.property_types || []);
}

export async function predictPrice(payload) {
  const params = new URLSearchParams();
  params.append('locality', payload.locality);
  params.append('property_type', payload.property_type);
  params.append('area_in_sqft', String(payload.area_in_sqft));
  params.append('age_of_property', String(payload.age_of_property));
  params.append('bedrooms', String(payload.bedrooms));

  const res = await fetch(`${BASE}/predict_home_price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  return handleFetch(res);
}

export default { fetchLocations, fetchPropertyTypes, predictPrice };
