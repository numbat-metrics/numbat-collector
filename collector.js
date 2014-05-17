/*

Collector server here.

Receives json blobs over sockets (if configured) or TCP (if configured)
Emits to the configured list of receivers: InfluxDB & Riemann supported
logs interesting events to bunyan

buffers & deals with backpressure if necessary

*/

var
    _       = require('lodash'),
    assert  = require('assert'),
    events  = require('events'),
    restify = require('restify'),
    util    = require('util')
    ;


var Collector = module.exports = function Collector(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.listen, 'you must pass a port number in `listen`');
    assert(opts.outputs && _.isArray(opts.outputs), 'you must pass an array of clients in `outputs`');

};
