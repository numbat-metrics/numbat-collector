/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand  = require('must'),
	sinon   = require('sinon'),
	Numbat  = require('../index'),
	Output  = require('../lib/output-jut'),
	Request = require('request')
;

describe('jut output', function()
{
	var goodOpts =
	{
		target:    'http://localhost:3030',
		batchSize: 500,
	};

	it('demands an options object', function()
	{
		function shouldThrow() { return new Output(); }
		shouldThrow.must.throw(/options/);
	});

	it('demands a target option', function()
	{
		function shouldThrow() { return new Output({ }); }
		shouldThrow.must.throw(/target/);
	});

	it('can be constructed', function()
	{
		var output = new Output(goodOpts);
		output.must.be.an.object();
		output.must.be.instanceof(Output);
		output.must.have.property('client');
	});

	it('defaults its batch size to 1000', function()
	{
		var output = new Output({ target: 'http://localhost:3030' });
		output.must.have.property('batchSize');
		output.batchSize.must.equal(1000);
	});

	it('respects the batchSize option if provided', function()
	{
		var output = new Output(goodOpts);
		output.batchSize.must.equal(goodOpts.batchSize);
	});

	it('batches up events on write', function(done)
	{
		var output = new Output(goodOpts);
		output.write({ name: 'test', value: 4 }, function()
		{
			output.batch.must.be.an.array();
			output.batch.length.must.equal(1);
			output.batch[0].must.be.an.object();
			output.batch[0].name.must.equal('test');
			output.batch[0].must.have.property('time');
			done();
		});
	});

	it('must eventually call write with its buffer', function(done)
	{
		var output = new Output(goodOpts);
		var saved = output.request;

		output.request = function(opts, cb)
		{
			opts.must.be.an.object();
			opts.json.must.be.true();
			cb.must.be.a.function();
			opts.body.must.be.an.array();
			opts.body.length.must.be.at.least(2);

			for (var i = 0; i < opts.body.length; i++)
			{
				var point = opts.body[i];
				point.must.be.an.object();
				point.must.have.property('pid');
				point.pid.must.equal(process.pid);
				point.must.have.property('time');
				point.time.must.be.a.string();
				point.must.have.property('value');
				point.value.must.be.a.number();
				point.must.not.have.property('metric');
			}

			output.request = saved;
			cb();

			done();
		};

		output.batchSize = 2;
		output.write({ name: 'metric.one', value: 1 });
		output.write({ name: 'metric.two', metric: 2, host: 'localhost' });
	});

	it('handles write errors by retrying', function(done)
	{
		var output = new Output(goodOpts);
		var saved = Request.post;
		var spy = sinon.spy(output.log, 'error');

		output.request = function(opts, cb)
		{
			output.batch.length.must.equal(0);
			cb(new Error('oops'));

			spy.called.must.be.true();
			spy.calledTwice.must.be.true();
			output.batch.length.must.be.at.least(2);
			spy.restore();
			output.request = saved;

			done();
		};

		output.batchSize = 2;
		output.write({ name: 'metric.one', value: 1 });
		output.write({ name: 'metric.two', value: 2, host: 'localhost' });
	});
});
