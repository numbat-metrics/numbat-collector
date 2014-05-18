var
    _      = require('lodash'),
    assert = require('assert'),
    events = require('events'),
    Influx = require('influx'),
    stream = require('stream'),
    util   = require('util')
    ;

var InfluxOutput = module.exports = function InfluxOutput(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.hosts && _.isArray(opts.hosts), 'you must pass an array in the `hosts` option');
    assert(opts.port && _.isNumber(opts.port), 'you must pass a `port` option');
    assert(opts.user && _.isString(opts.user), 'you must pass a `user` option');
    assert(opts.pass && _.isString(opts.pass), 'you must pass a `pass` option');
    assert(opts.db && _.isString(opts.db), 'you must pass a `db` option');

    stream.Writable.call(this, { objectMode: true });

    this.options = opts;
    this.client = Influx(opts.hosts, opts.port, opts.user, opts.pass, opts.db);
};
util.inherits(InfluxOutput, stream.Writable);

InfluxOutput.prototype.client = null;

InfluxOutput.prototype.toString = function toString()
{
    return '[ InfluxDB ' + this.options.db + ' @ ' + this.options.hosts + ' ]';
};

InfluxOutput.prototype._write = function _write(event, encoding, callback)
{
    var point = {};
    _.assign(point, event);
    if (point.metric) point.value = point.metric;
    delete point.metric;
    delete point.metricF;
    this.client.writePoint(event.service, point, callback);
};
