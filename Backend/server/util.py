import pickle
import json
import numpy as np

__locations = None
__data_columns = None
__model = None
__property_types = None

def get_estimated_price(locality, property_type, area_in_sqft, age_of_property, bedrooms):
    try:
        loc_index = __data_columns.index(locality.lower())
        pro_index = __data_columns.index(property_type.lower())
    except:
        loc_index = -1
        pro_index = -1

    x = np.zeros(len(__data_columns))
    x[0] = area_in_sqft
    x[1] = age_of_property
    x[2] = bedrooms

    if loc_index >= 0:
        x[loc_index] = 1
    if pro_index >= 0:
        x[pro_index] = 1

    return round(__model.predict([x])[0],2)


def load_saved_artifacts():
    print("loading saved artifacts...start")
    global  __data_columns
    global __locations
    global __property_types

    with open("./artifacts/columns.json", "r") as f:
        __data_columns = json.load(f)['data_columns']
        __locations = __data_columns[3:-3]  # first 3 columns are sqft, age, bhk
        __property_types = __data_columns[-3:]

    global __model
    if __model is None:
        with open('./artifacts/hyderabad_home_prices_model.pickle', 'rb') as f:
            __model = pickle.load(f)
    print("loading saved artifacts...done")

def get_location_names():
    return __locations

def get_property_types():
    return __property_types

def get_data_columns():
    return __data_columns

if __name__ == '__main__':
    load_saved_artifacts()
    print(get_location_names())
    print(get_estimated_price('AS Rao Nagar','Apartment', 680, 6, 2))
    print(get_estimated_price('Kompally','Apartment', 1700, 0, 3))
    print(get_estimated_price('AS Rao Nagar','Apartment', 1800, 0, 3))
