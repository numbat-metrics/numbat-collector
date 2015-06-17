/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	bole   = require('bole'),
	fs     = require('fs'),
	Output = require('../lib/output-prettylog')
;

describe('prettylog output', function()
{
	var output;
	var mockopts = { name: 'test-1' };

	it('takes name input', function()
	{
		var out = new Output('fred');
		out.name.must.equal('fred');

		var out2 = new Output();
		out2.name.must.equal('numbat');
	});

	it('can be constructed', function()
	{
		output = new Output(mockopts);
		output.must.be.an.object();
		output.must.be.instanceof(Output);
		output.name.must.equal('test-1');
	});

	it('creates a logger client', function()
	{
		output.must.have.property('client');
		output.client.must.be.truthy();
		output.client.must.have.property('info');
		output.client.info.must.be.a.function();
	});

	it('the path option is optional', function(done)
	{
		output.write({ test: 'yes'}, function()
		{
			done();
		});
	});

	it('has a useful toString() implementation', function()
	{
		var str = output.toString();
		str.must.equal('[ prettylog @ test-1 ]');
	});
});
