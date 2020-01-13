"use strict";

module.exports = {
    "rtlBinary": 'rtl_433',
    "rtlTimezone": 'UTC',
    "rtlArguments": ['-f', '433924000', '-F', 'json', '-R', '19', '-g', '0'],
    "es": {
        "indexBaseName": "sensors-",
        "client": {
            "node": "http://nuc:9200"
        }
    },
    "roomMapping": [
        {
		"id": 89,
		"channel": 3,
		"name": "Badezimmer"
	},
        {
		"id": 80,
		"channel": 1,
		"name": "Wintergarten"
	},
        {
		"id": 101,
		"channel": 2,
		"name": "Küche"
	},
        {
		"id": 134,
		"channel": 3,
		"name": "Vorzimmer"
	},
        {
		"id": 113,
		"channel": 1,
		"name": "Wohnzimmer"
	},
        {
		"id": 100,
		"channel": 1,
		"name": "Zimmer Markus"
	},
        {
		"id": 131,
		"channel": 2,
		"name": "Außen Garten"
	},
        {
		"id": 1,
		"channel": 2,
		"name": "Zimmer Ferdinand"
	},
        {
		"id": 92,
		"channel": 1,
		"name": "Außen Straße"
	}
    ],
    "ignore": [
        {
		"id": 1,
		"channel": 1
	}
    ],
    "data": {
        "fieldNameMapping": {
            "temperature_C": "temperature"
        },
        "fieldNameList": [
            "id",
            "channel",
            "temperature_C",
            "humidity",
            "battery"
        ]
    }
};
