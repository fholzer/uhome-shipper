const elasticsearch = require('elasticsearch'),
	uuidv4 = require('uuid/v4');

var client = new elasticsearch.Client({
	host: "nuc:9200"
});


const idRoomMapping = {
	"43936": "Badezimmer",
	"43937": "Wintergarten",
	"43938": "Küche",
	"43939": "Vorzimmer",
	"43940": "Wohnzimmer"
};

const UHOME_FIELD_MAPPING = {
	"temperature_C": "temperature"
};

const UHOME_FIELD_NAMES = [
	"id",
	"temperature_C",
	"humidity",
	"voltage"
]

var spawn = require('child_process').spawn,
    ls = spawn('rtl_433', ['-f', '433950000', '-F', 'json', '-g', '35']);

var buffer = '';

/**
 *  * Parses a string containing one or multiple JSON encoded objects in the string.
 *   * The result is always an array of objects.
 *    *
 *     * @param  {String} data
 *      * @return {Array}
 *       */
function parseJson(data) {
    data = data.replace('\n', '', 'g');

    var
        start = data.indexOf('{'),
        open = 0,
        i = start,
        len = data.length,
        result = [];

    for (; i < len; i++) {
        if (data[i] == '{') {
            open++;
        } else if (data[i] == '}') {
            open--;
            if (open === 0) {
                result.push(JSON.parse(data.substring(start, i + 1)));
                start = i + 1;
            }
        }
    }

    return result;
}

ls.stdout.on('data', function(data) {
    buffer += data;
    console.log(buffer);

    try {
        var dataSet = parseJson(buffer);
        console.log(dataSet);

        if (dataSet.length === 0)
            return;
	
	var now = new Date(),
	    indexName = "sensors-" + now.getUTCFullYear() + "." + (now.getUTCMonth() + 1) + "." + now.getUTCDate();

        for (var i = 0; i < dataSet.length; i++) {
            var data = dataSet[i];
            switch (data.model) {
                case 'µHome':
		    var doc = {
			    "model": "uhome",
			    "@timestamp": data.time
		    };

		    if(data.hasOwnProperty("id") && idRoomMapping.hasOwnProperty(data.id)) {
			    doc.room = idRoomMapping[data.id];
		    }

		    UHOME_FIELD_NAMES.forEach(f => {
			    if(data.hasOwnProperty(f) && data[f] > 0) {
				    let pname = UHOME_FIELD_MAPPING.hasOwnProperty(f) ? UHOME_FIELD_MAPPING[f] : f;
				    doc[pname] = data[f];
			    }
		    });
		    client.create({
			    index: indexName,
			    type: "doc",
			    id: uuidv4(),
			    body: doc
		    }, (err, res) => {
			    if(err) {
				    console.log("ERROR", err);
			    }
		    });
                    break;
            }
        }

        buffer = '';
    } catch (e) {
        console.log(e);
    }
});

ls.stderr.on('data', function(data) {
    console.log('stderr: ' + data.toString());
});

ls.on('exit', function(code) {
    console.log('child process exited with code ' + code.toString());
});
