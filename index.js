const elasticsearch = require('elasticsearch'),
    uuidv4 = require('uuid/v4'),
    throughLineReader = require('through2-linereader'),
    process = require('process');

var client = new elasticsearch.Client({
    host: "nuc:9200"
});


const idRoomMapping = {
    "43936": "Badezimmer",
    "43937": "Wintergarten",
    "43938": "Küche",
    "43939": "Vorzimmer",
    "43940": "Wohnzimmer",
    "43941": "Schlafzimmer"
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

var env = Object.create(process.env);
env.TZ = 'UTC';

var spawn = require('child_process').spawn,
    ls = spawn('rtl_433', ['-f', '433950000', '-F', 'json', '-R', '99', '-g', '0'], { env: env });


ls.stdout.pipe(throughLineReader()).on('data', function(data) {

    try {
        var data = JSON.parse(data);

        var now = new Date(),
            indexName = "sensors-" + now.getUTCFullYear() + "." + (now.getUTCMonth() + 1) + "." + now.getUTCDate();

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
    } catch (e) {
        console.log(e);
    }
});

ls.stderr.on('data', function(data) {
    console.log('stderr: ' + data.toString());
});

ls.on('exit', function(code) {
    console.log('child process exited with code ' + code.toString());
    process.exit(-1);
});
