var
    stream = require('stream'),
    util   = require('util')
    ;

var JSONStream = module.exports = function JSONStream()
{
    stream.Transform.call(this, { objectMode: true });
};
util.inherits(JSONStream, stream.Transform);

JSONStream.prototype._buffer = null;

JSONStream.prototype._transform = function _transform(data, encoding, callback)
{
    if (this._buffer) data = Buffer.concat([this._buffer, data]);

    var ptr = 0, start = 0;
    while (ptr < data.length)
    {
        if (data[ptr] === 10)
        {
            try
            {
                var line = JSON.parse(data.slice(start, ptr));
                this.push(line);
                start = ++ptr;
            }
            catch (ex) { console.log(ex); break; }
        }
        ptr++;
    }
    this._buffer = data.slice(start);
    callback();
};
