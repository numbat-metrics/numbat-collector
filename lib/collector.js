'use strict';

const
	_               = require('lodash'),
	assert          = require('assert'),
	bole            = require('bole'),
	dgram           = require('dgram'),
	events          = require('events'),
	fs              = require('fs'),
	JSONStream      = require('json-stream'),
	WebSocketServer = require('ws').Server,
	net             = require('net'),
	Sink            = require('./sink'),
	util            = require('util'),
	http            = require('http')
	;

const Collector = module.exports = function Collector(opts)
{
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.listen && _.isObject(opts.listen), 'you must pass a host/port or path object in `listen`');
	assert(opts.outputs && _.isArray(opts.outputs), 'you must pass an array of clients in `outputs`');

	this.options = opts;
	this.log = bole(opts.name || 'collector');

	if (opts.listen.udp)
		this.createUDPListener();
	else if (opts.listen.ws)
		this.createWebsocketListener();
	else
		this.incoming = net.createServer(this.onConnection.bind(this));

	this.sink = new Sink(opts.outputs);
	this.sink.setMaxListeners(100);
	this.sink.on('error', (err) =>
	{
		this.log.warn(err);
	});
	this.streams = [];
};
util.inherits(Collector, events.EventEmitter);

Collector.prototype.sink     = null; // writable stream for outputs
Collector.prototype.streams  = null; // array of incoming streams; useful?
Collector.prototype.incoming = null; // the server listening for metrics

Collector.prototype.listen = function listen(cb)
{
	let opts = this.options.listen;

	if (opts.udp)
		return this.bind();

	let report = (item) =>
	{
		this.log.info('metrics collector now listening @ ' + item);
		if (cb) cb();
	};

	if (opts.ws)
		return this.incoming.listen(opts.port, opts.host, report.bind(this, opts.port));

	if (opts.path)
	{
		fs.unlink(opts.path, () =>
		{
			this.incoming.listen(opts.path, report.bind(this, opts.path));
		});
	}
	else
		this.incoming.listen(opts.port, opts.host, report.bind(this, opts.port));
};

// metrics incoming

Collector.prototype.destroy = function destroy(callback)
{
	this.log.info('destroy called; closing servers');
	this.incoming.close(() =>
	{
		// TODO
		callback();
	});
};

Collector.prototype.onConnection = function onConnection(socket)
{
	let address = socket.address();
	this.log.info('new tcp connection', { socket:  address });

	let jsonStream = new JSONStream();
	socket.pipe(jsonStream, { end: false }).pipe(this.sink, { end: false });

	socket.on('end', () =>
	{
		jsonStream.unpipe(this.sink);
		this.log.info('tcp connection ending', { socket: address });
	});

	this.emit('connection', socket);
};

// udp implementation

Collector.prototype.bind = function bind()
{
	let opts = this.options.listen;
	this.incoming.bind(opts.port, opts.host);
};

Collector.prototype.createUDPListener = function()
{
	this.incoming = dgram.createSocket('udp4', this.onUDPPacket.bind(this));

	this.incoming.on('error', (err) =>
	{
		this.log.error('listener error', err);
		this.incoming.close();
	});

	this.incoming.on('listening', () =>
	{
		let addy = this.incoming.address();
		this.log.info('now listening for data at ' + addy.address + ':' + addy.port);
		this.emit('ready');
	});
};

Collector.prototype.onUDPPacket = function onUDPPacket(packet, rinfo)
{
	// TODO Really should be better behaved about backpressure.
	this.log.debug('udp packet');
	this.sink.write(JSON.parse(packet));
};

// websocket implementation

Collector.prototype.createWebsocketListener = function createWebsocketListener()
{
	this.incoming = http.createServer();
	let wss = new WebSocketServer({
		server : this.incoming,
		path : this.options.listen.pathname || '/',
		disableHixie : true,
		verifyClient : (info, cb) =>
		{
			if (_.isFunction(this.options.listen.verifyClient))
				return this.options.listen.verifyClient(info, cb);
			cb(true);
		}
	});

	wss.on('connection', (ws) =>
	{
		this.log.info('new websocket connection', ws._socket.remoteAddress);

		// send ping/pong messages to keep connection alive
		// in case of network issues like loadbalancers
		// terminating long lived connections etc
		let pingThreshold = this.options.listen.keepAliveThreshold || 2;
		let pingFrequency = this.options.listen.keepAliveFrequency || 30 * 1000;

		ws.pingSent = 0;
		ws.pingInterval = setInterval(() =>
		{
			this.log.debug('websocket sent ping', ws._socket.remoteAddress);
			if (ws.readyState !== 1)
				return;
			if (ws.pingSent >= pingThreshold)
				return ws.close();
			ws.ping();
			ws.pingSent++;
		}, pingFrequency);

		ws.on('pong', () =>
		{
			this.log.debug('websocket got pong', ws._socket.remoteAddress);
			ws.pingSent = 0;
		});

		ws.on('message', (message) =>
		{
			this.log.debug('websocket message', ws._socket.remoteAddress);
			this.sink.write(JSON.parse(message));
		});

		ws.on('close', () =>
		{
			clearInterval(ws.pingInterval);
			this.log.info('websocket connection ending', ws._socket.remoteAddress);
		});

		ws.on('error', (error) =>
		{
			this.log.warn(error);
		});

	});

	wss.on('error', (error) =>
	{
		this.log.error('listener error', error);
	});
};
