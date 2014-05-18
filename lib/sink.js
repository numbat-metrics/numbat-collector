// Like a heat sink but for metrics

var
    _             = require('lodash'),
    assert        = require('assert'),
    stream        = require('stream'),
    InfluxClient  = require('./output-influx'),
    RiemannClient = require('./output-riemann'),
    util          = require('util')
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
        case 'riemann':
            return new RiemannClient(opts);

        case 'influxdb':
            return new InfluxClient(opts);

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
