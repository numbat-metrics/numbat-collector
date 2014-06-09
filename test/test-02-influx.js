'use strict';

var
    lab      = require('lab'),
    describe = lab.describe,
    it       = lab.it,
    demand   = require('must'),
    Influx   = require('../lib/output-influx')
    ;


function MockClient() {};
MockClient.prototype.writePoint = function writePoint(n, p, cb)
{
    this.name = n;
    this.point = p;
    cb();
};

describe('influx client', function()
{
    var mockopts =
    {
        hosts: ['localhost'],
        port:  8086,
        user:  'numbat',
        pass:  'my-top-secret',
        db:    'numbat'
    };

/*
    assert(opts.hosts && _.isArray(opts.hosts), 'you must pass an array in the `hosts` option');
    assert(opts.port && _.isNumber(opts.port), 'you must pass a `port` option');
    assert(opts.user && _.isString(opts.user), 'you must pass a `user` option');
    assert(opts.pass && _.isString(opts.pass), 'you must pass a `pass` option');
    assert(opts.db && _.isString(opts.db), 'you must pass a `db` option');
*/

    it('demands an options object', function(done)
    {
        function shouldThrow() { return new Influx(); }
        shouldThrow.must.throw(/options object/);
        done();
    });

    it('demands an array of hosts in its options', function(done)
    {
        function shouldThrow() { return new Influx({}); }
        shouldThrow.must.throw(/hosts/);
        done();
    });

    it('demands a numeric port option', function(done)
    {
        function shouldThrow() { return new Influx({ hosts: ['localhost'] }); }
        shouldThrow.must.throw(/port/);
        done();
    });

    it('demands a user option', function(done)
    {
        function shouldThrow() { return new Influx({ hosts: ['localhost'], port: 8086 }); }
        shouldThrow.must.throw(/user/);
        done();
    });

    it('demands a password option', function(done)
    {
        function shouldThrow() { return new Influx({
            hosts: ['localhost'],
            port: 8086,
            user: 'foo',
        }); }
        shouldThrow.must.throw(/pass/);
        done();
    });

    it('demands a db option', function(done)
    {
        function shouldThrow() { return new Influx({
            hosts:    ['localhost'],
            port:     8086,
            user:     'foo',
            pass: 'password'
        }); }
        shouldThrow.must.throw(/db/);
        done();
    });

    it('must be a writable stream', function(done)
    {
        var output = new Influx(mockopts);
        output.must.be.an.object();
        output.must.have.property('writable');
        output.writable.must.be.true();
        done();
    });

    it('creates an InfluxDB client', function(done)
    {
        var output = new Influx(mockopts);
        output.must.have.property('client');
        output.client.must.be.an.object();
        done();
    });

    it('must provide a useful toString()', function(done)
    {
        var output = new Influx(mockopts);
        output.must.have.property('toString');
        output.toString.must.be.a.function();
        var str = output.toString();
        str.must.equal('[ InfluxDB numbat @ localhost ]');
        done();
    });

    it('writes events to its output', function(done)
    {
        var output = new Influx(mockopts);
        output.client = new MockClient();

        output.write({ name: 'test', value: 4 }, function()
        {
            output.client.must.have.property('name');
            output.client.name.must.equal('test');
            output.client.must.have.property('point');
            output.client.point.must.eql({ name: 'test', value: 4 });
            done();
        });
    });

});
