"use strict";

const
	_      = require('lodash'),
	assert = require('assert'),
	bole   = require('bole'),
	Influx = require('influx'),
	stream = require('stream'),
	util   = require('util')
;

const InfluxOutput = module.exports = function InfluxOutput(opts)
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

InfluxOutput.prototype.client    = null;
InfluxOutput.prototype.errcount  = 0;
InfluxOutput.prototype.lasterror = 0;
InfluxOutput.prototype.THROTTLE  = 300000; // 5 minutes

InfluxOutput.prototype.toString = function toString()
{
	return '[ InfluxDB ' + this.options.database + ' @ ' +
		_.map(this.options.hosts, (h) => { return h.host; }).join(', ') +
		' ]';
};

InfluxOutput.prototype._write = function _write(event, encoding, callback)
{
	let point = _.pick(event, (v) => { return !_.isObject(v) && !_.isArray(v); });
	if (event.time)
		point.time = event.time;
	if (point.time && typeof point.time !== 'object') point.time = new Date(point.time);

	this.client.writePoint(event.name, point, (err) =>
	{
		if (err)
		{
			// throttle error reporting
			if (this.lasterror + this.THROTTLE < Date.now())
			{
				this.lasterror = Date.now();
				if (this.errcount > 0)
					this.log.error(this.errcount + ' error(s) writing points to influx suppressed');
				else
				{
					this.log.error('failure writing a point to influx:');
					this.log.error(event.name, point);
					this.log.error(err);
				}
				this.errcount = 0;
			}
			else
				this.errcount++;
		}
	});

	// we are firing & forgetting.
	callback();
};
