// Like a heat sink but for metrics

var
	isArray 	= require('lodash.isarray'),
	forEach 	= require('lodash.foreach'),
	map 		= require('lodash.map'),
	Analyzer  	= require('./output-analyzer'),
	assert    	= require('assert'),
	bole      	= require('bole'),
	Graphite  	= require('./output-graphite'),
	Influx    	= require('./output-influx'),
	Influx9   	= require('numbat-influx'),
	Log       	= require('./output-logfile'),
	PrettyLog 	= require('./output-prettylog'),
	stream    	= require('stream'),
	util      	= require('util')
;

var Sink = module.exports = function Sink(outputs)
{
	assert(outputs && isArray(outputs), 'you must pass an array of outputs');

	stream.PassThrough.call(this, { objectMode: true, highWaterMark: 1024 });

	this.log = bole('sink');
	var self = this;

	this.clients = map(outputs, function(opts)
	{
		switch (opts.type)
		{
		case 'analyzer':
			return new Analyzer(opts);

		case 'influx9':
		case 'influxdb9':
			return new Influx9(opts);

		case 'influx':
		case 'influxdb':
			return new Influx(opts);

		case 'graphite':
			return new Graphite(opts);

		case 'log':
		case 'logfile':
			return new Log(opts);

		case 'prettylog':
			return new PrettyLog(opts);

		default:
			self.log.warn(opts, 'skipping output; unknown type ' + opts.type);
		}
	});

	forEach(this.clients, function(c)
	{
		if (c) this.pipe(c);
	}.bind(this));
};
util.inherits(Sink, stream.PassThrough);

Sink.prototype.clients = null;
