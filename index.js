"use strict";

const config = require('./config'),
    elasticsearch = require('elasticsearch'),
    uuidv4 = require('uuid/v4'),
    throughLineReader = require('through2-linereader'),
    process = require('process');

var client = new elasticsearch.Client(config.es.client);
var env = Object.create(process.env);
env.TZ = "UTC";

var spawn = require('child_process').spawn,
    ls = spawn(config.rtlBinary, config.rtlArguments, { env: env });


ls.stdout.pipe(throughLineReader()).on('data', function(data) {

    try {
        var data = JSON.parse(data);

        var now = new Date(),
            indexName = config.indexBaseName + now.getUTCFullYear() + "." + (now.getUTCMonth() + 1) + "." + now.getUTCDate();

        switch (data.model) {
            case 'µHome':
                var doc = {
                    "model": "uhome",
                    "@timestamp": Date.parse(data.time + " GMT")
                };

                if(data.hasOwnProperty("id") && config.idRoomMapping.hasOwnProperty(data.id)) {
                    doc.room = config.idRoomMapping[data.id];
                }

                config.data.fieldNameList.forEach(f => {
                    if(data.hasOwnProperty(f)) {
                        let pname = config.data.fieldNameMapping.hasOwnProperty(f) ? config.data.fieldNameMapping[f] : f;
                        doc[pname] = data[f];
                    }
                });
                client.create({
                    index: config.es.indexBaseName,
                    type: config.es.documentType,
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
