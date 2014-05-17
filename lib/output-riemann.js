var
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

    this.client = riemann.createClient({
        host: opts.host,
        port: opts.port
    });
};
util.inherits(RiemannOutput, events.EventEmitter);

RiemannOutput.prototype.client = null; // client for data sink
