from flask import Flask, request, jsonify
import util

app = Flask(__name__)

@app.route('/get_location_names', methods=['GET'])
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/get_property_types', methods=['GET'])
def get_property_types():
    response = jsonify({
        'property_types': util.get_property_types()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/predict_home_price', methods=['GET', 'POST'])
def predict_home_price():
    locality = request.form['locality']
    property_type = request.form['property_type']
    area_in_sqft = float(request.form['area_in_sqft'])
    age_of_property = int(request.form['age_of_property'])
    bedrooms = int(request.form['bedrooms'])


    response = jsonify({
        'estimated_price': util.get_estimated_price(locality, property_type, area_in_sqft, age_of_property, bedrooms)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Home Price Prediction...")
    util.load_saved_artifacts()
    app.run()

