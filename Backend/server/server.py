# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import util
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for all routes and origins. For production, restrict origins to your frontend URL.
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    try:
        locations = util.get_location_names()
        # optionally ensure title-case if you want: [s.title() for s in locations]
        return jsonify({'locations': locations})
    except Exception as e:
        logger.exception("Error in get_location_names")
        return jsonify({'error': str(e)}), 500


@app.route('/get_property_types', methods=['GET'])
def get_property_types():
    try:
        property_types = util.get_property_types()
        return jsonify({'property_types': property_types})
    except Exception as e:
        logger.exception("Error in get_property_types")
        return jsonify({'error': str(e)}), 500


@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    """
    Accept both application/x-www-form-urlencoded (frontend) and application/json POST bodies.
    Expects keys:
      - locality
      - property_type
      - area_in_sqft
      - age_of_property
      - bedrooms
    """
    try:
        # Support JSON body
        if request.is_json:
            body = request.get_json()
            locality = body.get('locality')
            property_type = body.get('property_type')
            area_in_sqft = float(body.get('area_in_sqft', 0))
            age_of_property = int(body.get('age_of_property', 0))
            bedrooms = int(body.get('bedrooms', 0))
        else:
            # form data (application/x-www-form-urlencoded)
            locality = request.form.get('locality')
            property_type = request.form.get('property_type')
            area_in_sqft = float(request.form.get('area_in_sqft', 0))
            age_of_property = int(request.form.get('age_of_property', 0))
            bedrooms = int(request.form.get('bedrooms', 0))

        # Validate minimal inputs
        if not locality or not property_type:
            return jsonify({'error': 'locality and property_type are required'}), 400

        estimated = util.get_estimated_price(locality, property_type, area_in_sqft, age_of_property, bedrooms)

        return jsonify({'estimated_price': estimated})
    except Exception as e:
        logger.exception("Error in predict_home_price")
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    # Load model or artifacts (your util function)
    logger.info("Loading saved artifacts...")
    util.load_saved_artifacts()
    logger.info("Starting Python Flask Server For Home Price Prediction...")

    # Use environment PORT when provided (Render / other hosts set PORT)
    port = int(os.environ.get("PORT", 5000))
    # host 0.0.0.0 so external hosts can reach it (Render / Docker)
    app.run(host="0.0.0.0", port=port, debug=False)
