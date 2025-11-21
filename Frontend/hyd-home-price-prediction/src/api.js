// src/api.js
// Simple API wrapper for the Flask backend
const BASE = 'http://localhost:5000'; // change if your Flask server uses another host/port

async function handleFetch(res) {
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let body = await res.text();
    // try parse json
    if (contentType.includes('application/json')) {
      try { body = JSON.stringify(await res.json(), null, 2); } catch(e) {}
    }
    throw new Error(`API error ${res.status}: ${body}`);
  }
  // attempt to parse json
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  const txt = await res.text();
  try { return JSON.parse(txt); } catch(e) { return txt; }
}

export async function fetchLocations() {
  const res = await fetch(`${BASE}/get_location_names`, { method: 'GET' });
  return handleFetch(res).then(json => json.locations || []);
}

export async function fetchPropertyTypes() {
  const res = await fetch(`${BASE}/get_property_types`, { method: 'GET' });
  return handleFetch(res).then(json => json.property_types || []);
}

/**
 * predictPrice
 * payload should be an object with keys:
 *  - locality (string)
 *  - property_type (string)
 *  - area_in_sqft (number)
 *  - age_of_property (number)
 *  - bedrooms (number)
 *
 * Uses application/x-www-form-urlencoded to match your server.request.form usage.
 */
export async function predictPrice(payload) {
  const params = new URLSearchParams();
  params.append('locality', payload.locality);
  params.append('property_type', payload.property_type);
  params.append('area_in_sqft', String(payload.area_in_sqft));
  params.append('age_of_property', String(payload.age_of_property));
  params.append('bedrooms', String(payload.bedrooms));

  const res = await fetch(`${BASE}/predict_home_price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  return handleFetch(res);
}

export default {
  fetchLocations,
  fetchPropertyTypes,
  predictPrice
};
