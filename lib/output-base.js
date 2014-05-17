var
    events = require('events'),
    util   = require('util')
    ;


var OutputBase = module.exports = function OutputBase()
{
    events.EventEmitter.call(this);
};
util.inherits(OutputBase, events.EventEmitter);
