var
    OutputBase = require('./output-base'),
    util       = require('util')
    ;


var InfluxOutput = module.exports = function InfluxOutput(opts)
{
    OutputBase.call(this, opts);
};
util.inherits(InfluxOutput, OutputBase);
