var
	_          = require('lodash'),
	assert     = require('assert'),
	bole       = require('bole'),
	dgram      = require('dgram'),
	events     = require('events'),
	fs         = require('fs'),
	JSONStream = require('json-stream'),
	net        = require('net'),
	Sink       = require('./sink'),
	util       = require('util')
	;

var Collector = module.exports = function Collector(opts)
{
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.listen && _.isObject(opts.listen), 'you must pass a host/port or path object in `listen`');
	assert(opts.outputs && _.isArray(opts.outputs), 'you must pass an array of clients in `outputs`');

	this.options = opts;
	this.log = bole(opts.name || 'collector');

	if (opts.listen.udp)
		this.createUDPListener();
	else
		this.incoming = net.createServer(this.onConnection.bind(this));

	this.sink = new Sink(opts.outputs);
	this.sink.on('error', function(err)
	{
		this.log.warn(err);
	}.bind(this));
	this.streams = [];
};
util.inherits(Collector, events.EventEmitter);

Collector.prototype.sink     = null; // writable stream for outputs
Collector.prototype.streams  = null; // array of incoming streams; useful?
Collector.prototype.incoming = null; // the server listening for metrics

Collector.prototype.listen = function listen(cb)
{
	var opts = this.options.listen;
	if (opts.udp)
		return this.bind();

	function report(item)
	{
		this.log.info('metrics collector now listening @ ' + item);
		if (cb) cb();
	}

	if (opts.path)
	{
		fs.unlink(opts.path, function()
		{
			this.incoming.listen(opts.path, report.bind(this, opts.path));
		}.bind(this));
	}
	else
		this.incoming.listen(opts.port, opts.host, report.bind(this, opts.port));
};

// metrics incoming

Collector.prototype.destroy = function destroy(callback)
{
	this.log.info('destroy called; closing servers');
	this.incoming.close(function()
	{
		// TODO
		callback();
	});
};

Collector.prototype.onConnection = function onConnection(socket)
{
	this.log.info('new tcp connection', { socket: socket.address() });
	var transform;
	var transformer = function(chunk)
	{
		if (transform) return;

		transform = new JSONStream();
		transform.pipe(this.sink);
		transform.write(chunk);
		socket.pipe(transform);
	}.bind(this);

	socket.on('end', function()
	{
		if (transform)
		{
			socket.unpipe(transform);
			transform.unpipe();
			transform = null;
		}
	});

	socket.on('data', transformer);
	socket.on('close', function onCloseSocket()
	{
		this.log.info('tcp connection closing', { socket: socket.address() });
	}.bind(this));

	this.emit('connection', socket);
};

// udp implementation

Collector.prototype.bind = function bind()
{
	var opts = this.options.listen;
	this.incoming.bind(opts.port, opts.host);
};

Collector.prototype.createUDPListener = function()
{
	this.incoming = dgram.createSocket('udp4', this.onUDPPacket.bind(this));

	this.incoming.on('error', function(err)
	{
		this.log.error('listener error', err);
		this.incoming.close();
	}.bind(this));

	this.incoming.on('listening', function()
	{
		var addy = this.incoming.address();
		this.log.info('now listening for data at ' + addy.address + ':' + addy.port);
		this.emit('ready');
	}.bind(this));
};

Collector.prototype.onUDPPacket = function onUDPPacket(packet, rinfo)
{
	// TODO Really should be better behaved about backpressure.
	this.log.debug('udp packet');
	this.sink.write(JSON.parse(packet));
};
