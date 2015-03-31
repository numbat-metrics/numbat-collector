var
    _      = require('lodash'),
    assert = require('assert'),
    bole   = require('bole'),
    events = require('events'),
    Influx = require('influx'),
    stream = require('stream'),
    util   = require('util')
    ;

var InfluxOutput = module.exports = function InfluxOutput(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.hosts && _.isArray(opts.hosts), 'you must pass an array in the `hosts` option');
    assert(opts.username && _.isString(opts.username), 'you must pass a `username` option');
    assert(opts.password && _.isString(opts.password), 'you must pass a `password` option');
    assert(opts.database && _.isString(opts.database), 'you must pass a `database` option');

    stream.Writable.call(this, { objectMode: true });
    if (!opts.requestTimeout) opts.requestTimeout = 65000; // in ms

    this.options = opts;
    this.client = Influx(opts);
    this.log = bole('influx');
    this.log.info('influx output configured');
};
util.inherits(InfluxOutput, stream.Writable);

InfluxOutput.prototype.client = null;

InfluxOutput.prototype.toString = function toString()
{
    return '[ InfluxDB ' + this.options.database + ' @ ' +
        _.map(this.options.hosts, function(h) { return h.host; }).join(', ') +
        ' ]';
};

InfluxOutput.prototype._write = function _write(event, encoding, callback)
{
    var point = {};
    _.assign(point, event);
    if (point.tags) delete point.tags; // influx client does not like arrays
    if (point.time && typeof point.time !== 'object') point.time = new Date(point.time);

    // we are firing & forgetting.
    process.nextTick(callback);

    var self = this;
    self.client.writePoint(event.name, point, function(err)
    {
        self.log.error('failure writing a point to influx:');
        self.log.error(err);
    });
};
