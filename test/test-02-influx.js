/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	_      = require('lodash'),
	demand = require('must'),
	sinon  = require('sinon'),
	Influx = require('../lib/output-influx')
	;

function MockClient() {}
MockClient.prototype.writeSeries = function writeSeries(series, cb)
{
	this.series = series;
	// Keep the old test API for the first data point.
	this.name = Object.keys(series)[0];
	this.point = series[this.name][0][0];
	this.tags = series[this.name][0][1];
	process.nextTick(cb);
};

function writeSeriesFail(series, cb)
{
	process.nextTick(function()
	{
		cb(new Error('oh dear I failed'));
	});
}

describe('influx client', function()
{
	var mockopts = {
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
			return new Influx({
				hosts:    [ { host:'localhost', port:8086}],
				username: 'foo',
				password: 'password'
			});
		}
		shouldThrow.must.throw(/database/);
		done();
	});

	it('respects a batchTimeout option if you provide one', function()
	{
		var opts = _.clone(mockopts);
		opts.batchTimeout = 50;
		var output = new Influx(opts);
		output.options.batchTimeout.must.equal(50);
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

		output.write({ name: 'test', value: 4, tag: 't' }, function()
		{
			output.client.must.have.property('name');
			output.client.name.must.equal('test');
			output.client.must.have.property('point');
			output.client.point.must.be.an.object();
			output.client.point.value.must.equal(4);
			output.client.tags.must.be.an.object();
			output.client.tags.tag.must.equal('t');
			done();
		});
	});

	it('cleans up tags', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();

		output.write({ name: 'test', value: 4, status: 'ok', tag: 't', time: Date.now() }, function()
		{
			output.client.tags.must.be.an.object();
			output.client.tags.must.not.have.property('time');
			output.client.tags.must.not.have.property('value');
			output.client.tags.status.must.equal('ok');
			done();
		});
	});

	it('does not write heartbeats', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();

		output.write({ name: 'heartbeat', value: 4, status: 'ok', tag: 't', time: Date.now() }, function()
		{
			output.client.must.not.have.property('heartbeat');
			done();
		});
	});

	it('fixes up points with undefined values', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();

		output.write({ name: 'devalued', value: undefined, status: 'ok', tag: 't', time: Date.now() }, function()
		{
			output.client.series.must.have.property('devalued');
			output.client.point.value.must.have.equal(1);
			done();
		});
	});

	it('fixes up points with null values', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();

		output.write({ name: 'devalued', value: null, status: 'ok', tag: 't', time: Date.now() }, function()
		{
			output.client.series.must.have.property('devalued');
			output.client.point.value.must.have.equal(1);
			done();
		});
	});

	it('has a tag sanitizer', function()
	{
		Influx.must.have.property('sanitizeTag');
		Influx.sanitizeTag.must.be.a.function();
		Influx.sanitizeTag('okay').must.equal('okay');
		Influx.sanitizeTag('i-have-hyphens').must.equal('i_have_hyphens');
		Influx.sanitizeTag('i have spaces').must.equal('i_have_spaces');
	});

	it('sanitizes tag names', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();

		output.write({ name: 'i-am-invalid', value: 5, status: 'ok', tag: 't', time: Date.now() }, function()
		{
			output.client.name.must.equal('i-am-invalid');
			done();
		});
	});

	it('skips null & undefined tag values', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();

		output.write({ name: 'i-am-invalid', value: 5, status: 'ok', undef: undefined, nully: null, time: Date.now() }, function()
		{
			output.client.tags.must.have.property('status');
			output.client.tags.must.not.have.property('undef');
			output.client.tags.must.not.have.property('nully');
			done();
		});
	});

	it('handles failures by logging', function(done)
	{
		var output = new Influx(mockopts);
		output.client = new MockClient();
		output.client.writeSeries = writeSeriesFail;

		var count = 0;
		output.log.error = function()
		{
			count++;
			if (count === 1)
				arguments[0].must.equal('failure writing batch to influx:');
			else if (count === 2)
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
		output.client.writeSeries = writeSeriesFail;
		var spy = output.log.error = sinon.spy();

		output.write({ name: 'test', value: 4 }, function()
		{
			spy.calledTwice.must.be.true();
			output.write({ name: 'test', value: 4 }, function()
			{
				spy.callCount.must.be.below(3);
				output.THROTTLE = 0; // stop throttling
				output.write({ name: 'test', value: 4 }, function()
				{
					spy.lastCall.args[0].must.match(/writing points to influx suppressed|oh dear/);
					done();
				});
			});
		});
	});

	it('batches events', function(done)
	{
		var opts = _.clone(mockopts);
		opts.batchSize = 3;
		var output = new Influx(opts);
		output.client = new MockClient();

		output.write({ name: 'test_a', value: 4 }, function() {});
		output.write({ name: 'test_a', value: 7 }, function() {});
		output.write({ name: 'test_b', value: 5 }, function()
		{
			Object.keys(output.client.series).length.must.be.equal(2);
			output.client.series.test_a.must.be.an.object();
			output.client.series.test_b.must.be.an.object();
			output.client.series.test_a[0][0].value.must.be.equal(4);
			output.client.series.test_b[0][0].value.must.be.equal(5);
			output.batchLength.must.be.equal(0);
			done();
		});
	});

	it('sends an under-sized batch after the timeout expires', function(done)
	{
		var opts = _.clone(mockopts);
		opts.batchSize = 1000;
		opts.batchTimeout = 200; // in ms
		var output = new Influx(opts);
		output.client = new MockClient();

		output.client.writeSeries = function(series, cb)
		{
			Object.keys(series).length.must.equal(1);
			Date.now().must.be.below(start + 300);
			done();
		};

		var start = Date.now();
		output.write({ name: 'test_a', value: 4 });
	});
});
