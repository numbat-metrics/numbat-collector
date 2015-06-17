var
	_      = require('lodash'),
	assert = require('assert'),
	bole   = require('bole'),
	fs     = require('fs'),
	stream = require('stream'),
	util   = require('util')
;

var LogOutput = module.exports = function LogOutput(opts)
{
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.name && _.isString(opts.name), 'you must pass a `name` option');

	stream.Writable.call(this, { objectMode: true });

	this.options = opts;

	if (opts.path && _.isString(opts.path))
	{
		bole.output({
			level: 'info',
			stream: fs.createWriteStream(opts.path, { flags: 'a', encoding: 'utf8', mode: 0666 })
		});
	}
	this.client = bole(opts.name);
};
util.inherits(LogOutput, stream.Writable);

LogOutput.prototype.client = null; // client for data sink

LogOutput.prototype._write = function _write(event, encoding, callback)
{
	this.client.info(event.name, event);
	callback();
};

LogOutput.prototype.toString = function toString()
{
	return '[ logfile @ ' + this.options.path + ' ]';
};
