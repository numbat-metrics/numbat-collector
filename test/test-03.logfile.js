'use strict';

var
    lab       = require('lab'),
    describe  = lab.describe,
    it        = lab.it,
    demand    = require('must'),
    bole      = require('bole'),
    fs        = require('fs'),
    LogOutput = require('../lib/output-logfile'),
    mkdirp    = require('mkdirp'),
    path      = require('path'),
    rimraf    = require('rimraf')
    ;

var tmpdir = './tmp';

describe('logfile output', function()
{
    var output;
    var mockopts = { path: path.join(tmpdir, 'foo.log'), name: 'test-1' };

    lab.before(function(done)
    {
        mkdirp(tmpdir, done);
    });

    it('demands an options object', function(done)
    {
        function shouldThrow() { return new LogOutput(); }
        shouldThrow.must.throw(/options/);
        done();
    });

    it('demands a name object', function(done)
    {
        function shouldThrow() { return new LogOutput({ path: '../tmp'}); }
        shouldThrow.must.throw(/name/);
        done();
    });

    it('can be constructed', function(done)
    {
        output = new LogOutput(mockopts);
        output.must.be.an.object();
        output.must.be.instanceof(LogOutput);
        done();
    });

    it('creates a logger client', function(done)
    {
        output.must.have.property('client');
        output.client.must.be.truthy();
        output.client.must.have.property('info');
        output.client.info.must.be.a.function();
        done();
    });

    it('emits to its logfile', function(done)
    {
        output.write({ test: 'yes'}, function()
        {
            fs.readFile(mockopts.path, function(err, data)
            {
                data = data.toString('utf8');
                var first = data.split('\n')[0];
                var written = JSON.parse(first);
                written.must.be.an.object();
                written.level.must.equal('info');
                written.name.must.equal('test-1');
                written.test.must.equal('yes');
                done();
            });
        });
    });

    it('the path option is optional', function(done)
    {
        var consoleOut = new LogOutput({ name: 'test-2' });
        output.write({ test: 'yes'}, function()
        {
            done();
        });
    });

    it('has a useful toString() implementation', function(done)
    {
        var str = output.toString();
        str.must.equal('[ logfile @ tmp/foo.log ]');
        done();
    });

    lab.after(function(done)
    {
        rimraf(tmpdir, done);
    });

});
