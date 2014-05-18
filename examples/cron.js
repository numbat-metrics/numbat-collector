#!/usr/bin/env node

// An example of a standalone emitter that sends a set of data points when run

var Emitter = require('numbat-emitter');

var emitter = new Emitter({
    host: 'localhost',
    port: 3333,
    node: 'test-1'
});

emitter.metric({ service: 'httpd.latency', metric:  Math.round(Math.random() * 1000) });
emitter.metric({ service: 'disk.used.percent', metric: Math.random() * 100 });
emitter.metric({ service: 'heartbeat'});

setTimeout(function()
{
    emitter.destroy();
    process.exit(0);
}, 1000);
