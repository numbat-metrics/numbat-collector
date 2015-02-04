'use strict';

var
    Lab      = require('lab'),
    lab      = exports.lab = Lab.script(),
    describe = lab.describe,
    it       = lab.it,
    demand   = require('must'),
    Numbat   = require('../index')
    ;

describe('collector', function()
{
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
        it('should have tests');
    });

});
