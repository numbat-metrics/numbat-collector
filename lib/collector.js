var
    _          = require('lodash'),
    assert     = require('assert'),
    events     = require('events'),
    fs         = require('fs'),
    JSONStream = require('json-stream'),
    net        = require('net'),
    Sink       = require('./sink'),
    stream     = require('stream'),
    util       = require('util')
    ;


var Collector = module.exports = function Collector(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.listen && _.isObject(opts.listen), 'you must pass a host/port or path object in `listen`');
    assert(opts.outputs && _.isArray(opts.outputs), 'you must pass an array of clients in `outputs`');
    assert(opts.log, 'you must pass a bunyan logger in `opts.log`');

    this.options = opts;
    this.log = opts.log;

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
Collector.prototype.collectServer = null; // the TCP server listening for metrics

Collector.prototype.listen = function listen()
{
    var opts = this.options.listen;

    function report(item)
    {
        this.log.info('metrics collector now listening @ ' + item);
    }

    if (opts.path)
    {
        fs.unlink(opts.path, function()
        {
            this.collectServer.listen(opts.path, report.bind(this, opts.path));
        }.bind(this));
    }
    else
        this.collectServer.listen(opts.port, opts.host, report.bind(this, opts.port));
};

// metrics incoming

Collector.prototype.destroy = function destroy(callback)
{
    this.log.info('destroy called; closing servers');
    this.collectServer.close(function()
    {
        // TODO
        callback();
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
