// Like a heat sink but for metrics

var
	_            = require('lodash'),
	Analyzer     = require('./output-analyzer'),
	assert       = require('assert'),
	InfluxOutput = require('./output-influx'),
	LogOutput    = require('./output-logfile'),
	PrettyLog    = require('./output-prettylog'),
	Graphite     = require('./output-graphite'),
	stream       = require('stream'),
	util         = require('util')
;

var Sink = module.exports = function Sink(outputs, log)
{
	assert(outputs && _.isArray(outputs), 'you must pass an array of outputs');
	assert(log, 'you must pass a bunyan logger in the `log` argument');

	stream.PassThrough.call(this, { objectMode: true });

	this.log = log;

	this.clients = _.map(outputs, function(opts)
	{
		switch (opts.type)
		{
		case 'analyzer':
			return new Analyzer(opts);

		case 'influxdb':
			return new InfluxOutput(opts);

		case 'graphite':
			return new Graphite(opts);

		case 'log':
		case 'logfile':
			return new LogOutput(opts);

		case 'prettylog':
			return new PrettyLog(opts);

		default:
			this.log.warning(opts, 'skipping output; unknown type ' + opts.type);
		}
	});

	_.each(this.clients, function(c)
	{
		this.pipe(c);
	}.bind(this));
};
util.inherits(Sink, stream.PassThrough);

Sink.prototype.clients = null;
