var
	_      = require('lodash'),
	assert = require('assert'),
	bole   = require('bole'),
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
	if (!opts.batchTimeout) opts.batchTimeout = 30000; // in ms

	this.options = opts;
	this.client = new Influx.InfluxDB(opts);

	this.batch = {};
	this.batchLength = 0;
	// Default to 1 to be backwards-compatible.
	this.batchSize = opts.batchSize || 1;

	this.batchTimeout = opts.batchTimeout;
	this.nextBatchTime = Date.now() + opts.batchTimeout;
	this.resetTimer();

	this.log = bole('influx-9');
	this.log.info('influx output configured for ' + opts.database);
};
util.inherits(InfluxOutput, stream.Writable);

InfluxOutput.prototype.client    = null;
InfluxOutput.prototype.errcount  = 0;
InfluxOutput.prototype.lasterror = 0;
InfluxOutput.prototype.THROTTLE  = 300000; // 5 minutes
InfluxOutput.prototype.batchTimeout = 0;
InfluxOutput.prototype.nextBatchTime = 0;

InfluxOutput.prototype.toString = function toString()
{
	return '[ InfluxDB ' + this.options.database + ' @ ' +
		_.map(this.options.hosts, function(h) { return h.host; }).join(', ') +
		' ]';
};

InfluxOutput.prototype.resetTimer = function resetTimer()
{
	var self = this;
	if (this.timer)
		clearTimeout(this.timer);
	this.timer = setTimeout(function() { self.writeBatch(); }, self.batchTimeout);
	this.nextBatchTime = Date.now() + self.batchTimeout;
};

InfluxOutput.prototype.writeBatch = function writeBatch()
{
	var self = this;
	if (!self.batch || !self.batchLength) return;

	var batch = self.batch;
	self.batch = {};
	self.batchLength = 0;
	self.resetTimer();

	self.client.writeSeries(batch, function(err)
	{
		if (err)
		{
			// throttle error reporting
			if (self.lasterror + self.THROTTLE < Date.now())
			{
				self.lasterror = Date.now();
				if (self.errcount > 0)
					self.log.error(self.errcount + ' error(s) writing points to influx suppressed');
				else
				{
					self.log.error('failure writing batch to influx:');
					self.log.error(err);
				}
				self.errcount = 0;
			}
			else
				self.errcount++;
		}
	});
};

InfluxOutput.sanitizeTag = function sanitizeTag(input)
{
	return input.replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '_').replace(/\s+/gi, '_');
};

InfluxOutput.prototype._write = function _write(event, encoding, callback)
{
	if (!event.name) return callback();
	if (event.name.match(/heartbeat/)) return callback();
	if (_.isUndefined(event.value) || _.isNull(event.value))
		event.value = 1;
	var point = { value: event.value };
	var name = event.name;

	var tags = {};
	_.each(event, function(v, k)
	{
		if (k === 'time') return;
		if (k === 'value') return;
		if (k === 'name') return;
		if (!_.isObject(v) && !_.isArray(v) && !_.isUndefined(v) && !_.isNull(v))
			tags[InfluxOutput.sanitizeTag(k)] = v;
	});

	if (event.time)
		point.time = event.time;
	if (point.time && typeof point.time !== 'object')
		point.time = new Date(point.time);

	++this.batchLength;
	if (!this.batch[name])
		this.batch[name] = [[point, tags]];
	else
		this.batch[name].push([point, tags]);

	if (this.batchLength >= this.batchSize || Date.now() > this.nextBatchTime)
	{
		this.writeBatch();
	}

	// we are firing & forgetting.
	callback();
};
