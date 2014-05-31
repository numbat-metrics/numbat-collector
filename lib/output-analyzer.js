var
    _      = require('lodash'),
    assert = require('assert'),
    net    = require('net'),
    stream = require('stream'),
    util   = require('util')
    ;

var AnalyzerOutput = module.exports = function AnalyzerOutput(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.host && _.isString(opts.host), 'you must pass a `host` option');
    assert(opts.port && _.isNumber(opts.port), 'you must pass a `port` option');

    stream.Writable.call(this, { objectMode: true });

    this.options = opts;

    this.output = new JSONOutputStream();
    this.connect();
};
util.inherits(AnalyzerOutput, stream.Writable);

AnalyzerOutput.prototype.client  = null; // client for data sink
AnalyzerOutput.prototype.backlog = null;
AnalyzerOutput.prototype.ready   = false;

AnalyzerOutput.prototype.connect = function connect()
{
    if (this.ready) return; // TODO might throw an error instead

    if (this.client)
    {
        this.client.removeAllListeners();
        this.output.unpipe();
        this.client = null;
    }

    this.client = net.connect(this.options.port, this.options.host);
    this.output.pipe(this.client);
    this.client.on('connect', this.onConnect.bind(this));
    this.client.on('error', this.onError.bind(this));
    this.client.on('close', this.onClose.bind(this));
};

AnalyzerOutput.prototype.destroy = function destroy()
{
    if (!this.client) return;
    this.output.unpipe();
    this.client.removeAllListeners();
    this.client.end();
    this.client = null;
};

AnalyzerOutput.prototype.onConnect = function onConnect()
{
    while (this.backlog.length)
        this._write(this.backlog.shift());
    this.ready = true;
    this.emit('ready');
};

AnalyzerOutput.prototype.onError = function onError(err)
{
    this.ready = false;
    this.emit('close');
    this.connect();
};

AnalyzerOutput.prototype.onClose = function onClose()
{
    this.ready = false;
    this.emit('close');
    this.connect();
};

AnalyzerOutput.prototype._write = function _write(event, encoding, callback)
{
    this.output.write(JSON.stringify(event) + '\n', encoding, callback);
};

AnalyzerOutput.prototype.toString = function toString()
{
    return '[ analyzer @ ' + this.options.path + ' ]';
};

function JSONOutputStream()
{
    stream.Transform.call(this);
    this._readableState.objectMode = false;
    this._writableState.objectMode = true;
}
util.inherits(JSONOutputStream, stream.Transform);

JSONOutputStream.prototype._transform = function _transformOut(object, encoding, callback)
{
    this.push(object);
    callback();
};
