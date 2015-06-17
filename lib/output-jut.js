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
	this.request = opts.request || require('client-request');

	this.logger = bole(this.toString());
};
util.inherits(JutOutput, stream.Writable);

JutOutput.prototype.client = null; // client for data sink
JutOutput.prototype.batch = [];
JutOutput.prototype.batchSize = 1000;

JutOutput.prototype._write = function _write(event, encoding, callback)
{
	var point = { source_type: 'metric', pid: process.pid };
	_.assign(point, event);
	if (point.tags) delete point.tags; // influx client does not like arrays
	if (!point.time)
		point.time = (new Date()).toISOString();
	if (typeof point.time !== 'object')
		point.time = new Date(point.time).toISOString();

	this.batch.push(point);
	if (this.batch.length >= this.batchSize)
		this.writeBatch();

	process.nextTick(callback);
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
			self.logger.error('failed to write batch; retrying; length=' + writeMe.length);
			self.logger.error(err);
			self.batch = writeMe.concat(self.batch);
			return;
		}

		self.logger.debug('wrote ' + writeMe.length + ' data points');
	});
};

JutOutput.prototype.toString = function toString()
{
	return '[ jut @ ' + this.options.target + ' ]';
};
