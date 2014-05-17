var
    OutputBase = require('./output-base'),
    riemann    = require('riemann'),
    util       = require('util')
    ;


var RiemannOutput = module.exports = function RiemannOutput(opts)
{
    OutputBase.call(this, opts);
};
util.inherits(RiemannOutput, OutputBase);
