/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	_      = require('lodash'),
	demand = require('must'),
	sinon  = require('sinon'),
	Influx = require('../lib/output-influx')
;

function MockClient() {}
MockClient.prototype.writePoint = function writePoint(n, p, cb)
{
	this.name = n;
	this.point = p;
	process.nextTick(cb);
};

function writePointFail(n, p, cb)
{
	process.nextTick(function()
	{
		cb(new Error('oh dear I failed'));
	});
}

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
		function shouldThrow()
		{
			return new Influx({
				hosts: ['localhost'],
				username: 'foo',
			});
		}
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

	it('defaults requestTimeout to 65 seconds', function()
	{
		var output = new Influx(mockopts);
		output.options.requestTimeout.must.equal(65000);
		output.client.request.defaultRequestOptions.timeout.must.equal(65000);
	});

	it('respects a requestTimeout option if you provide one', function()
	{
		var opts = _.clone(mockopts);
		opts.requestTimeout = 50;
		var output = new Influx(opts);
		output.options.requestTimeout.must.equal(50);
		output.client.request.defaultRequestOptions.timeout.must.equal(50);
	});

	it('must be a writable stream', function()
	{
		var output = new Influx(mockopts);
		output.must.be.an.object();
		output.must.have.property('writable');
		output.writable.must.be.true();
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

		output.write({ name: 'test', value: 4, obj: {}, fn: function() {}, arr : [] }, function()
		{
			output.client.must.have.property('name');
			output.client.name.must.equal('test');
			output.client.must.have.property('point');
			output.client.point.name.must.equal('test');
			output.client.point.value.must.equal(4);
			output.client.point.must.not.have.property('obj');
			output.client.point.must.not.have.property('fn');
			output.client.point.must.not.have.property('arr');
			done();
		});
	});

	it('handles failures by logging', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();
		output.client.writePoint = writePointFail;

		var count = 0;
		output.log.error = function()
		{
			count++;
			if (count === 1)
				arguments[0].must.equal('failure writing a point to influx:');
			else if (count === 2)
			{
				arguments[0].must.equal('test');
			}
			else if (count === 3)
			{
				arguments[0].must.be.instanceof(Error);
				arguments[0].message.must.equal('oh dear I failed');
				done();
			}
		};

		output.write({ name: 'test', value: 4 }, function() { });
	});

	it('throttles frequent error log spam', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();
		output.client.writePoint = writePointFail;
		var spy = output.log.error = sinon.spy();

		output.write({ name: 'test', value: 4 }, function()
		{
			spy.calledThrice.must.be.true();
			output.write({ name: 'test', value: 4 }, function()
			{
				spy.callCount.must.be.below(4);
				output.THROTTLE = 0; // stop throttling
				output.write({ name: 'test', value: 4 }, function()
				{
					spy.lastCall.args[0].must.match(/writing points to influx suppressed|oh dear/);
					done();
				});
			});
		});
	});
});
