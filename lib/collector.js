/*

Collector server here.

Receives json blobs over sockets (if configured) or TCP (if configured)
Emits to the configured list of receivers: InfluxDB & Riemann supported
logs interesting events to bunyan

buffers & deals with backpressure if necessary

*/

var
    _         = require('lodash'),
    ObjStream = require('objectstream'),
    assert    = require('assert'),
    events    = require('events'),
    net       = require('net'),
    restify   = require('restify'),
    Sink      = require('./sink'),
    stream    = require('stream'),
    util      = require('util')
    ;


var Collector = module.exports = function Collector(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.admin && _.isObject(opts.admin), 'you must pass a host/port object in `admin`');
    assert(opts.metrics && _.isObject(opts.metrics), 'you must pass a host/port object in `metrics`');
    assert(opts.outputs && _.isArray(opts.outputs), 'you must pass an array of clients in `outputs`');
    assert(opts.log, 'you must pass a bunyan logger in `opts.log`');

    this.options = opts;
    this.log = opts.log;

    var restifyOpts = { log: this.log };
    this.adminServer = this.createAdminAPI(restifyOpts);
    this.collectServer = net.createServer(this.onConnection.bind(this));

    this.sink = new Sink(opts.outputs, this.log);
    this.streams = [];
};
util.inherits(Collector, events.EventEmitter);

Collector.prototype.sink          = null; // writable stream for outputs
Collector.prototype.streams       = null; // array of incoming streams; useful?
Collector.prototype.adminServer   = null; // the restify admin service
Collector.prototype.collectServer = null; // the TCP server listening for metrics

Collector.prototype.listen = function listen()
{
    var opts = this.options;

    this.adminServer.listen(opts.admin.port, opts.admin.host, function()
    {
        this.log.info('admin API now listening on port ' + opts.admin.port);
    }.bind(this));
    this.collectServer.listen(opts.metrics.port, opts.metrics.host, function()
    {
        this.log.info('metrics collector now listening on port ' + opts.metrics.port);
    }.bind(this));
};

// metrics incoming

Collector.prototype.destroy = function destroy()
{
    this.log.info('destroy called; closing servers');
    this.adminServer.close();
    this.collectServer.close(function()
    {
        // TODO
    }.bind(this));
};

Collector.prototype.onConnection = function onConnection(socket)
{
    var input = ObjStream.createDeserializeStream(socket);
    input.pipe(this.sink);
    this.streams.push(input);

    socket.on('close', function onCloseSocket()
    {
        _.pull(this.streams, input);
        this.log.info('1 incoming connection closed; ' + this.streams.length + ' connections');
    }.bind(this));

    this.log.info('new incoming connection; ' + this.streams.length + ' connections');
    this.emit('connection', socket);
};


// admin interface; consider splitting out

Collector.prototype.createAdminAPI = function createAdminAPI(restifyOpts)
{
    var server = restify.createServer(restifyOpts);

    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(logEachRequest);
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser({ mapParams: false }));

    server.get('/ping', this.handlePing.bind(this));
    server.get('/status', this.handleStatus.bind(this));

    return server;
};

Collector.prototype.handlePing = function handlePing(request, response, next)
{
    response.send(200, 'pong');
    next();
};

Collector.prototype.handleStatus = function handleStatus(request, response, next)
{
    var status =
    {
        pid:    process.pid,
        uptime: process.uptime(),
        rss:    process.memoryUsage(),
        outputs: this.outputs.join(', ')
    };
    response.json(200, status);
    next();
};

function logEachRequest(request, response, next)
{
    request.log.info(request.method, request.url);
    next();
}
