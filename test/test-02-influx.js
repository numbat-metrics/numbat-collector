'use strict';

var
    Lab      = require('lab'),
    lab      = exports.lab = Lab.script(),
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
        hosts:    [{ host: 'localhost', port:  8086 }],
        username: 'numbat',
        password: 'my-top-secret',
        database: 'numbat'
    };

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

    it('demands a username option', function(done)
    {
        function shouldThrow() { return new Influx({ hosts: ['localhost'], port: 8086 }); }
        shouldThrow.must.throw(/username/);
        done();
    });

    it('demands a password option', function(done)
    {
        function shouldThrow() { return new Influx({
            hosts: ['localhost'],
            username: 'foo',
        }); }
        shouldThrow.must.throw(/password/);
        done();
    });

    it('demands a database option', function(done)
    {
        function shouldThrow()
        {
            return new Influx(
            {
                hosts:    [ { host:'localhost', port:8086}],
                username: 'foo',
                password: 'password'
            });
        }
        shouldThrow.must.throw(/database/);
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
