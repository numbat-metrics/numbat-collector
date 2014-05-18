var
    _       = require('lodash'),
    assert  = require('assert'),
    events  = require('events'),
    riemann = require('riemann'),
    util    = require('util')
    ;

var RiemannOutput = module.exports = function RiemannOutput(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.host && _.isString(opts.host), 'you must pass a `host` option');
    assert(opts.port && _.isString(opts.port), 'you must pass a `port` option');

    events.EventEmitter.call(this);

    this.options = opts;
    this.client = riemann.createClient({
        host: opts.host,
        port: opts.port
    });
};
util.inherits(RiemannOutput, events.EventEmitter);

RiemannOutput.prototype.client = null; // client for data sink


/*
host	A hostname, e.g. "api1", "foo.com"
service	e.g. "API port 8000 reqs/sec"
state	Any string less than 255 bytes, e.g. "ok", "warning", "critical"
time	The time of the event, in unix epoch seconds
description	Freeform text
tags	Freeform list of strings, e.g. ["rate", "fooproduct", "transient"]
metric	A number associated with this event, e.g. the number of reqs/sec.
ttl	A floating-point time, in seconds, that this event is considered valid for. Expired states may be removed from the index.
*/

RiemannOutput.prototype.toString = function toString()
{
    return '[ Riemann @ ' + this.options.host + ':' + this.options.port + ' ]';
};
