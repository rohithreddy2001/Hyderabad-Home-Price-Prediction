// src/api.js
// Uses REACT_APP_API_URL provided by Vercel. Falls back to '' for local dev.
const BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, ''); // no trailing slash
const LOCS_CACHE_KEY = 'hp_locations_v1';
const PROPT_CACHE_KEY = 'hp_property_types_v1';
// TTL in ms (e.g., 1 hour)
const CACHE_TTL = 1000 * 60 * 60;

function now() { return Date.now(); }

async function handleFetch(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Helper: get cached value from localStorage if still valid
 * stored structure: { ts: timestamp, value: [...] }
 */
function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts) return null;
    if (now() - parsed.ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.value;
  } catch (e) {
    console.warn('Cache read error', e);
    return null;
  }
}

function setCached(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: now(), value }));
  } catch (e) {
    console.warn('Cache write error', e);
  }
}

/**
 * fetch helper that tries network, falls back to cached value if network fails
 * (but we rely on callers to use getCached(...) first for instant UI)
 */
async function fetchJson(url) {
  const res = await fetch(url, { method: 'GET' });
  return handleFetch(res);
}

export async function fetchLocations({ forceRefresh = false } = {}) {
  // 1) try immediate local cache for snappy UI
  if (!forceRefresh) {
    const cached = getCached(LOCS_CACHE_KEY);
    if (cached) return cached;
  }

  // 2) fetch from network (use absolute URL)
  const url = `${BASE}/get_location_names`;
  try {
    const json = await fetchJson(url);
    const list = json.locations || [];
    setCached(LOCS_CACHE_KEY, list);
    return list;
  } catch (err) {
    // network failed — try cached stale data as last resort
    const fallback = getCached(LOCS_CACHE_KEY);
    if (fallback) return fallback;
    throw err;
  }
}

export async function fetchPropertyTypes({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = getCached(PROPT_CACHE_KEY);
    if (cached) return cached;
  }

  const url = `${BASE}/get_property_types`;
  try {
    const json = await fetchJson(url);
    const list = json.property_types || [];
    setCached(PROPT_CACHE_KEY, list);
    return list;
  } catch (err) {
    const fallback = getCached(PROPT_CACHE_KEY);
    if (fallback) return fallback;
    throw err;
  }
}

/**
 * Fetch both lists in parallel. Returns { locations, property_types }
 * Uses local cache first (very fast) then triggers network updates if needed.
 *
 * options: { forceRefresh: boolean }
 */
export async function fetchLists({ forceRefresh = false } = {}) {
  // Try to get cached immediately for both
  const cachedLocs = !forceRefresh ? getCached(LOCS_CACHE_KEY) : null;
  const cachedProps = !forceRefresh ? getCached(PROPT_CACHE_KEY) : null;

  // If both cached, return early
  if (cachedLocs && cachedProps) {
    // kick off background refresh but do not block UI
    (async () => {
      try {
        await Promise.all([fetchLocations({ forceRefresh: true }), fetchPropertyTypes({ forceRefresh: true })]);
      } catch {}
    })();
    return { locations: cachedLocs, property_types: cachedProps };
  }

  // Otherwise fetch both in parallel and return result
  const pLoc = fetchLocations({ forceRefresh });
  const pProp = fetchPropertyTypes({ forceRefresh });
  const [locations, property_types] = await Promise.all([pLoc, pProp]);
  return { locations, property_types };
}

/*
 predictPrice stays the same (POST form-encoded)
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  return handleFetch(res);
}

export default { fetchLocations, fetchPropertyTypes, fetchLists, predictPrice };
