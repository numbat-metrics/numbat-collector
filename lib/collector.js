var
    _           = require('lodash'),
    assert      = require('assert'),
    events      = require('events'),
    JSONStream  = require('./json-stream'),
    net         = require('net'),
    restify     = require('restify'),
    Sink        = require('./sink'),
    stream      = require('stream'),
    util        = require('util')
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
    this.sink.on('error', function(err)
    {
        this.log.warn(err);
    }.bind(this));
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
    this.streams.push(socket); // probably not useful, nuke

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
        _.pull(this.streams, socket);
    }.bind(this));

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
        outputs: _.map(this.sink.clients, function(c) { return c.toString(); }),
    };
    response.json(200, status);
    next();
};

function logEachRequest(request, response, next)
{
    request.log.info(request.method, request.url);
    next();
}
