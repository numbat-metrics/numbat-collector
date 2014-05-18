// Like a heat sink but for metrics

var
    _             = require('lodash'),
    assert        = require('assert'),
    stream        = require('stream'),
    InfluxClient  = require('./output-influx'),
    RiemannClient = require('./output-riemann')
    ;

// TODO sink is a writable stream

var Sink = module.exports = function Sink(outputs, log)
{
    assert(outputs && _.isArray(outputs), 'you must pass an array of outputs');
    assert(log, 'you must pass a bunyan logger in the `log` argument');

    this.log = log;

    this.clients = _.map(outputs, function(opts)
    {
        switch (opts.type)
        {
        case 'riemann':
            return new RiemannClient(opts);
            break;

        case 'influxdb':
            return new InfluxClient(opts);
            break;

        default:
            this.log.warning(opts, 'skipping output; unknown type ' + opts.type);
        }
    });
};

Sink.prototype.clients = null;
