var
	_       = require('lodash'),
	assert  = require('assert'),
	bole    = require('bole'),
	stream  = require('stream'),
	fs      = require('fs'),
	util    = require('util')
;

var JutOutput = module.exports = function JutOutput(opts)
{
	// TODO assert on required config
	// TODO auth?
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.target && _.isString(opts.target), 'you must pass an `target` option');

	if (opts.batchSize && _.isNumber(opts.batchSize))
		this.batchSize = opts.batchSize;

	stream.Writable.call(this, { objectMode: true });

	this.options = opts;
	this.target = opts.target;
	this.request = opts.request || require('request');

	this.log = bole('jut');
	this.log.info('jut output configured');
};
util.inherits(JutOutput, stream.Writable);

JutOutput.prototype.client    = null; // client for data sink
JutOutput.prototype.batch     = [];
JutOutput.prototype.batchSize = 1000;
JutOutput.prototype.lasterror = 0;
JutOutput.prototype.THROTTLE  = 300000; // 5 minutes
JutOutput.prototype.log = null;

JutOutput.prototype._write = function _write(event, encoding, callback)
{
	if (event.name === 'heartbeat') return callback();
	var point = _.pick(event, function(v) { return !_.isObject(v) && !_.isArray(v); });
	if (point.metric && !point.value)
	{
		point.value = point.metric;
		delete point.metric;
	}
	point.time = (new Date()).toISOString();
	point.pid = process.pid;

	this.batch.push(point);
	if (this.batch.length >= this.batchSize)
		this.writeBatch();

	callback();
};

JutOutput.prototype.writeBatch = function writeBatch()
{
	var self = this;

	var writeMe = this.batch;
	this.batch = [];
	var opts =
	{
		uri:     this.target,
		method:  'POST',
		body:    writeMe,
		json:    true,
		timeout: 5000
	};

	this.request(opts, function(err, response, body)
	{
		if (err)
		{
			// throttle error reporting
			if (self.lasterror + self.THROTTLE < Date.now())
			{
				self.lasterror = Date.now();
				if (self.errcount > 0)
					self.log.error(self.errcount + ' error(s) writing points to jut suppressed');
				else
				{
					self.log.error('failed to write batch; retrying; length=' + writeMe.length);
					self.log.error(err);
					self.batch = writeMe.concat(self.batch);
				}
				self.errcount = 0;
			}
			else
				self.errcount++;
		}
		else
		{
			self.log.debug('wrote ' + writeMe.length + ' data points');
		}
	});
};

JutOutput.prototype.toString = function toString()
{
	return '[ jut@' + this.options.target + ' ]';
};
