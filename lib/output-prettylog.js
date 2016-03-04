var
	isString 	= require('lodash.isstring'),
	isObject 	= require('lodash.isobject'),
	bole   		= require('bole'),
	stream 		= require('stream'),
	util   		= require('util')
;

var PrettyLog = module.exports = function PrettyLog(opts)
{
	stream.Writable.call(this, { objectMode: true });

	if (opts && isString(opts))
		this.name = opts;
	else if (opts && isObject(opts) && opts.name)
		this.name = opts.name;

	var prettystream = require('bistre')({time: true});

	if (opts && opts.pipe) prettystream.pipe(process.stdout);
	bole.output({ level: 'info', stream: prettystream });

	this.client = bole(this.name);
};
util.inherits(PrettyLog, stream.Writable);

PrettyLog.prototype.client = null; // client for data sink
PrettyLog.prototype.name = 'numbat';

PrettyLog.prototype._write = function _write(event, encoding, callback)
{
	this.client.info(event.name, event);
	callback();
};

PrettyLog.prototype.toString = function toString()
{
	return '[ prettylog @ ' + this.name + ' ]';
};
