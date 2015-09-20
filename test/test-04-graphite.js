/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand   = require('must'),
	sinon    = require('sinon'),
	Graphite = require('../lib/output-graphite')
	;

describe('graphite output', function()
{
	var goodOpts =
	{
		host:       'localhost',
		port:       6666,
		batchDelay: 500,
	};

	it('demands an options object', function()
	{
		function shouldThrow() { return new Graphite(); }
		shouldThrow.must.throw(/options/);
	});

	it('demands a host option', function()
	{
		function shouldThrow() { return new Graphite({ }); }
		shouldThrow.must.throw(/host/);
	});

	it('demands a port option', function()
	{
		function shouldThrow() { return new Graphite({ host: 'localhost' }); }
		shouldThrow.must.throw(/port/);
	});

	it('can be constructed', function()
	{
		var output = new Graphite(goodOpts);
		output.must.be.an.object();
		output.must.be.instanceof(Graphite);
		output.must.have.property('socket');
	});

	it('defaults its batch delay to 5 seconds', function()
	{
		var output = new Graphite({ host: 'localhost', port: 6666 });
		output.options.must.have.property('batchDelay');
		output.options.batchDelay.must.equal(5000);
	});

	it('respects the batchDelay option if provided', function()
	{
		var output = new Graphite(goodOpts);
		output.options.batchDelay.must.equal(goodOpts.batchDelay);
	});

	it('batches up events on write', function(done)
	{
		var output = new Graphite(goodOpts);
		output.write({ name: 'test', value: 4 }, function()
		{
			done();
		});
		output.batch.must.be.an.array();
		output.batch.length.must.equal(1);
		output.batch[0].must.match(/^test 4 \d+/);
	});

	it('must eventually call send on its socket', function(done)
	{
		var output = new Graphite(goodOpts);

		output.socket.send = function(data, start, length, port, host, cb)
		{
			Buffer.isBuffer(data).must.be.true();
			start.must.equal(0);
			length.must.equal(data.length);
			port.must.equal(goodOpts.port);
			host.must.equal(goodOpts.host);
			cb.must.be.a.function();

			done();
		};

		output.write({ name: 'test', value: 4 });
	});

	it('logs on socket error', function(done)
	{
		var output = new Graphite(goodOpts);
		var stub = sinon.stub(output.socket, 'send');
		stub.yields(new Error('oh noes'));

		var count = 0;
		output.log.error = function(msg)
		{
			count++;
			if (count === 1) msg.must.equal('problem writing to graphite');
			if (count === 2) done();
		};

		output.write({ name: 'test', value: 4 });
	});

	it('copes well with malformed metrics', function(done)
	{
		var output = new Graphite(goodOpts);
		output.log.info = function(data, msg)
		{
			data.must.be.an.object();
			data.name.must.equal('test');
			msg.must.match(/declining to write malformed metric to graphite/);
			done();
		};

		output.write({ name: 'test' });
	});

	it('logs socket errors', function(done)
	{
		var output = new Graphite(goodOpts);
		var count = 0;
		output.log.error = function(msg)
		{
			count++;
			if (count === 1) msg.must.equal('socket error');
			if (count === 2) done();
		};

		output.socket.emit('error', new Error('fake'));
	});

});
