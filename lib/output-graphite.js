var
	_      = require('lodash'),
	assert = require('assert'),
	bole   = require('bole'),
	dgram  = require('dgram'),
	events = require('events'),
	stream = require('stream'),
	util   = require('util')
;

var GraphiteUDP = module.exports = function GraphiteUDP(opts)
{
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.host && _.isString(opts.host), 'you must pass a hostname in the `host` option');
	assert(opts.port && _.isNumber(opts.port), 'you must pass a `port` option');

	stream.Writable.call(this, { objectMode: true });
	if (!opts.batchDelay || !_.isNumber(opts.batchDelay)) opts.batchDelay = 5000; // in ms

	this.socket = dgram.createSocket('udp4');
	this.socket.on('error', this.onError.bind(this));

	this.options = opts;
	this.log = bole('graphite ' + opts.host + ':' + opts.port);
	this.log.info('graphite output configured @ ' + opts.host + ':' + opts.port);
};
util.inherits(GraphiteUDP, stream.Writable);

GraphiteUDP.prototype.socket = null;
GraphiteUDP.prototype.timer = null;
GraphiteUDP.prototype.batch = [];

GraphiteUDP.prototype.onError = function onError(err)
{
	this.log.error('socket error');
	this.log.error(err);
};

GraphiteUDP.prototype.writeBatch = function writeBatch()
{
	var self = this;
	var data = new Buffer(this.batch.join('\n'));
	this.socket.send(data, 0, data.length, this.options.port, this.options.host, function(err, written)
	{
		if (err)
		{
			self.log.error('problem writing to graphite');
			self.log.error(err);
		}
		// TODO consider retrying and stuff
	});

	this.batch = [];
	this.timer = null;
};

GraphiteUDP.prototype._write = function _write(event, encoding, callback)
{
	if (!event.hasOwnProperty('name') || !event.hasOwnProperty('value'))
	{
		this.log.info(event, 'declining to write malformed metric to graphite', event);
		callback();
		return;
	}

	// timestamps must be unix epoch time in seconds
	var ts = event.time;
	if (!ts) ts = new Date();
	if (_.isObject(ts)) ts = Math.round(ts.getTime() / 1000);

	// graphite message format is name<space>value<space>timestamp
	this.batch.push([event.name, event.value, ts].join(' '));

	if (!this.timer) this.timer = setTimeout(this.writeBatch.bind(this), this.options.batchDelay);

	// we are firing & forgetting.
	callback();
};
