var Numbat  = require('./lib/collector');
Numbat.InfluxClient = require('./lib/output-influx');
Numbat.RiemannClient = require('./lib/output-riemann');

module.exports = Numbat;
