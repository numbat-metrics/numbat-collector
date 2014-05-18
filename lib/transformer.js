var
    stream = require('stream'),
    util   = require('util')
    ;

var JSONStream = module.exports = function JSONStream()
{
    stream.Transform.call(this, { objectMode: true });
    this._buffer = '';
};
util.inherits(JSONStream, stream.Transform);

JSONStream.prototype._buffer = null;

JSONStream.prototype._transform = function _transform(data, encoding, callback)
{
    data = this._buffer + data.toString('utf8');
    var lines = data.split('\n');

    this._buffer = lines.pop();

    lines.forEach(function(line)
    {
        try { line = JSON.parse(line); }
        catch (ex) { return; }
        this.push(line);

    }.bind(this));

    callback();
};
