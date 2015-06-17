/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand    = require('must'),
	sinon     = require('sinon'),
	Sink      = require('../lib/sink'),
	stream    = require('stream'),
	Analyzer  = require('../lib/output-analyzer'),
	Graphite  = require('../lib/output-graphite'),
	Influx    = require('../lib/output-influx'),
	Jut       = require('../lib/output-jut'),
	Log       = require('../lib/output-logfile'),
	PrettyLog = require('../lib/output-prettylog')
;

describe('sink', function()
{
	it('exports a function', function()
	{
		Sink.must.be.a.function();
	});

	it('requires an array of outputs', function()
	{
		function shouldThrow() { Sink(); }
		shouldThrow.must.throw(/array of outputs/);
	});

	it('handles analyzer type', function()
	{
		var outputs = [{ type: 'analyzer',  host: 'localhost', port: 3337 }];
		var sink = new Sink(outputs);
		sink.clients.must.be.an.array();
		sink.clients.length.must.equal(1);
		sink.clients[0].must.be.instanceof(Analyzer);
	});

	it('handles graphite type', function()
	{
		var outputs = [{ type: 'graphite', host: 'localhost', port: 3333 }];
		var sink = new Sink(outputs);
		sink.clients.must.be.an.array();
		sink.clients.length.must.equal(1);
		sink.clients[0].must.be.instanceof(Graphite);
	});

	it('handles influx type', function()
	{
		var outputs = [{ type: 'influxdb', hosts: [ { host: 'localhost',  port: 8086 }],
			username: 'numbat', password: 'my-top-secret', database: 'numbat' }];
		var sink = new Sink(outputs);
		sink.clients.must.be.an.array();
		sink.clients.length.must.equal(1);
		sink.clients[0].must.be.instanceof(Influx);
	});

	it('handles jut type', function()
	{
		var outputs = [{ type: 'jut', target: 'http://localhost:3030' }];
		var sink = new Sink(outputs);
		sink.clients.must.be.an.array();
		sink.clients.length.must.equal(1);
		sink.clients[0].must.be.instanceof(Jut);
	});

	it('handles logfile type', function()
	{
		var outputs = [{ type: 'log', name: 'numbat-1', path: './numbat.log' }];
		var sink = new Sink(outputs);
		sink.clients.must.be.an.array();
		sink.clients.length.must.equal(1);
		sink.clients[0].must.be.instanceof(Log);
	});

	it('handles prettylog type', function()
	{
		var outputs = [{ type: 'prettylog', name: 'numbat-1', pipe: true }];
		var sink = new Sink(outputs);
		sink.clients.must.be.an.array();
		sink.clients.length.must.equal(1);
		sink.clients[0].must.be.instanceof(PrettyLog);
	});

	it('throws for an unknown type', function()
	{
		var outputs = [{ type: 'fleejob', name: 'numbat-1', pipe: true }];
		var sink = new Sink(outputs);
	});

});
