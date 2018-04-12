"use strict";

module.exports = {
    "rtlBinary": 'rtl_433',
    "rtlTimezone": 'UTC',
    "rtlArguments": ['-f', '433950000', '-F', 'json', '-R', '99', '-g', '0'],
    "es": {
        "indexBaseName": "sensors-",
        "documentType": "doc",
        "client": {
            "host": "nuc:9200"
        }
    },
    "idRoomMapping": {
        "43936": "Badezimmer",
        "43937": "Wintergarten",
        "43938": "Küche",
        "43939": "Vorzimmer",
        "43940": "Wohnzimmer",
        "43941": "Schlafzimmer"
    },
    "data": {
        "fieldNameMapping": {
            "temperature_C": "temperature"
        },
        "fieldNameList": [
            "id",
            "temperature_C",
            "humidity",
            "voltage"
        ]
    }
};
