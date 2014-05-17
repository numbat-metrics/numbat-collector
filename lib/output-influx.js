var
    _          = require('lodash'),
    events     = require('events'),
    Influx     = require('influx'),
    util       = require('util')
    ;

var InfluxOutput = module.exports = function InfluxOutput(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.host && _.isString(opts.host), 'you must pass a `host` option');
    assert(opts.port && _.isString(opts.port), 'you must pass a `port` option');
    assert(opts.user && _.isString(opts.user), 'you must pass a `user` option');
    assert(opts.pass && _.isString(opts.pass), 'you must pass a `pass` option');
    assert(opts.db && _.isString(opts.db), 'you must pass a `db` option');

    events.EventEmitter.call(this);
    this.client = Influx(opts.host, opts.port, opts.user, opts.pass, opts.db);
};
util.inherits(InfluxOutput, events.EventEmitter);

InfluxOutput.prototype.client = null; // client for data sink
