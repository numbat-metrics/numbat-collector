var Numbat            = require('./lib/collector');
Numbat.InfluxOutput   = require('./lib/output-influx');
Numbat.LogOutput      = require('./lib/output-logfile');
Numbat.AnalyzerOutput = require('./lib/output-analyzer');
Numbat.GraphiteOutput = require('./lib/output-graphite');
Numbat.JutOutput      = require('./lib/output-jut');
Numbat.PrettyLog      = require('./lib/output-prettylog');

module.exports = Numbat;
