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
    if (!Buffer.isBuffer(data)) data = new Buffer(data);
    if (this._buffer) data = Buffer.concat([this._buffer, data]);

    var ptr = 0, start = 0;
    while (++ptr <= data.length)
    {
        if (data[ptr] === 10 || ptr === data.length)
        {
            try
            {
                var line = JSON.parse(data.slice(start, ptr));
                this.push(line);
            }
            catch (ex) { }
            if (data[ptr] === 10) start = ++ptr;
        }
    }

    this._buffer = data.slice(start);
    callback();
};
