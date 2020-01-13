"use strict";

const config = require('./config'),
    elasticsearch = require('@elastic/elasticsearch'),
    uuidv4 = require('uuid/v4'),
    throughLineReader = require('through2-linereader'),
    process = require('process');

var client = new elasticsearch.Client(config.es.client);
var env = Object.create(process.env);
env.TZ = config.rtlTimezone;

var spawn = require('child_process').spawn,
    ls = spawn(config.rtlBinary, config.rtlArguments, { env: env });


ls.stdout.pipe(throughLineReader()).on('data', function(data) {

    try {
        var data = JSON.parse(data);

        var now = new Date(),
            indexName = config.es.indexBaseName + now.getUTCFullYear() + "." + (now.getUTCMonth() + 1);

        switch (data.model) {
            case 'Nexus Temperature/Humidity':
                var doc = {
                    "model": "nexus",
                    "@timestamp": data.time
                };

                if(data.hasOwnProperty("id") && data.hasOwnProperty("channel")) {
                    var match = config.roomMapping.filter(e => data.id === e.id && data.channel === e.channel);
                    if(match.length === 1) {
                        doc.room = match[0].name;
                    } else {
                        match = config.ignore.filter(e => data.id === e.id && data.channel === e.channel);
                        if(match.length === 1) {
                            return;
                        }
                        console.log(`no mapping found for id ${data.id}, channel ${data.channel}`);
                    }
                }

                config.data.fieldNameList.forEach(f => {
                    if(data.hasOwnProperty(f)) {
                        let pname = config.data.fieldNameMapping.hasOwnProperty(f) ? config.data.fieldNameMapping[f] : f;
                        doc[pname] = data[f];
                    }
                });

                client.create({
                    index: indexName,
                    type: "_doc",
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
