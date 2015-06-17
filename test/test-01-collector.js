/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	sinon  = require('sinon'),
	Numbat = require('../index')
;

describe('collector', function()
{
	var udpOpts =
	{
		listen:
		{
			udp:  true,
			port: 4677,
			host: 'localhost'
		},
		outputs: []
	};

	var socketOpts =
	{
		listen: { path: '/tmp/numbat.sock' },
		outputs: []
	};

	var tcpOpts =
	{
		listen:
		{
			port: 4677,
			host: 'localhost'
		},
		outputs: []
	};

	describe('exports', function()
	{
		it('exports a function', function(done)
		{
			Numbat.must.be.a.function();
			done();
		});

		it('exports the three outputs as well', function(done)
		{
			Numbat.must.have.property('InfluxOutput');
			Numbat.InfluxOutput.must.be.a.function();
			Numbat.must.have.property('LogOutput');
			Numbat.LogOutput.must.be.a.function();
			Numbat.must.have.property('AnalyzerOutput');
			Numbat.AnalyzerOutput.must.be.a.function();

			done();
		});
	});

	describe('constructor', function()
	{
		var goodOpts =
		{
			listen: { path: '/tmp/numbat.sock' },
			outputs: []
		};

		it('requires an options object', function(done)
		{
			function shouldThrow() { return new Numbat(); }
			shouldThrow.must.throw('you must pass an options object');
			done();
		});

		it('requires a listen option', function(done)
		{
			function shouldThrow() { return new Numbat({}); }
			shouldThrow.must.throw(/listen/);
			done();
		});

		it('requires an outputs option', function(done)
		{
			function shouldThrow() { return new Numbat({ listen: { path: '/tmp/numbat.sock' }}); }
			shouldThrow.must.throw(/array of clients/);
			done();
		});

		it('can be constructed', function(done)
		{
			var collector = new Numbat(goodOpts);
			collector.must.be.instanceof(Numbat);

			done();
		});

	});

	describe('listen()', function()
	{
		it('listens on tcp if appropriate', function(done)
		{
			var collector = new Numbat(tcpOpts);
			var spy = sinon.spy(collector.incoming, 'listen');

			collector.listen(function()
			{
				spy.called.must.be.true();
				spy.calledWith(tcpOpts.listen.port, tcpOpts.listen.host).must.be.true;
				collector.destroy(done);
			});
		});

		it('connects to a socket if passed a path', function(done)
		{
			var collector = new Numbat(socketOpts);
			var spy = sinon.spy(collector.incoming, 'listen');

			collector.listen(function()
			{
				spy.called.must.be.true();
				spy.calledWith(tcpOpts.listen.path).must.be.true;
				collector.destroy(done);
			});
		});

		it('calls bind if udp is set', function(done)
		{
			var collector = new Numbat(udpOpts);
			var spy = sinon.spy(collector, 'bind');
			var spy2 = sinon.spy(collector.incoming, 'bind');

			collector.listen();
			spy.called.must.be.true();
			spy2.calledWith(udpOpts.listen.port, udpOpts.listen.host).must.be.true;

			collector.destroy();
			done();
		});
	});

	describe('destroy()', function()
	{
		it('should have tests');
	});

	describe('onConnection()', function()
	{
		it('should have tests');
	});

	describe('bind()', function()
	{
		it('should have tests');
	});

	describe('createUDPListener()', function()
	{
		it('should have tests');
	});

	describe('onUDPPacket()', function()
	{
		it('should have tests');
	});

});
