/*

Collector server here.

Receives json blobs over sockets (if configured) or TCP (if configured)
Emits to the configured list of receivers: InfluxDB & Riemann supported
logs interesting events to bunyan

buffers & deals with backpressure if necessary

*/

var
    _       = require('lodash'),
    assert  = require('assert')
    restify = require('restify')
    ;


var Collector = module.exports = function Collector(opts)
{

};
