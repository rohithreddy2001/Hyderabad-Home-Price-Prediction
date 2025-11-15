# Backend/server.py
import os
import logging
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_caching import Cache
import util

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Simple in-memory cache for Flask (works fine for single-instance Render)
cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 3600})
cache.init_app(app)

# Load artifacts once at startup
try:
    logger.info("Loading saved artifacts...")
    util.load_saved_artifacts()
    logger.info("Artifacts loaded successfully.")
except Exception as e:
    logger.exception("Failed to load saved artifacts at startup: %s", e)
    # continue; endpoints will handle missing data gracefully

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# Cache the list endpoints for 1 hour (3600s)
@app.route('/get_location_names', methods=['GET'])
@cache.cached(timeout=3600)
def get_location_names():
    try:
        locations = util.get_location_names()
        if locations is None:
            logger.warning("util.get_location_names() returned None — returning empty list.")
            locations = []
        resp = make_response(jsonify({'locations': locations}))
        # allow clients/CDNs to cache for an hour too
        resp.headers['Cache-Control'] = 'public, max-age=3600, s-maxage=3600'
        return resp
    except Exception as e:
        logger.exception("Error in get_location_names: %s", e)
        return jsonify({'locations': []}), 500

@app.route('/get_property_types', methods=['GET'])
@cache.cached(timeout=3600)
def get_property_types():
    try:
        pts = util.get_property_types()
        if pts is None:
            logger.warning("util.get_property_types() returned None — returning empty list.")
            pts = []
        resp = make_response(jsonify({'property_types': pts}))
        resp.headers['Cache-Control'] = 'public, max-age=3600, s-maxage=3600'
        return resp
    except Exception as e:
        logger.exception("Error in get_property_types: %s", e)
        return jsonify({'property_types': []}), 500

@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    try:
        if request.is_json:
            body = request.get_json()
            locality = body.get('locality')
            property_type = body.get('property_type')
            area_in_sqft = float(body.get('area_in_sqft', 0))
            age_of_property = int(body.get('age_of_property', 0))
            bedrooms = int(body.get('bedrooms', 0))
        else:
            locality = request.form.get('locality')
            property_type = request.form.get('property_type')
            area_in_sqft = float(request.form.get('area_in_sqft', 0))
            age_of_property = int(request.form.get('age_of_property', 0))
            bedrooms = int(request.form.get('bedrooms', 0))

        if not locality or not property_type:
            return jsonify({'error': 'locality and property_type are required'}), 400

        # If predictions are expensive and repeated, you can cache results too (per key).
        estimated = util.get_estimated_price(locality, property_type, area_in_sqft, age_of_property, bedrooms)
        return jsonify({'estimated_price': estimated})
    except Exception as e:
        logger.exception("Error in predict_home_price: %s", e)
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
