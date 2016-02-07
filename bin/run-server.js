#!/usr/bin/env node

'use strict';

const Numbat = require('../index'),
      bole   = require('bole'),
      path   = require('path');

const config = require(path.resolve(process.argv[2]));

const opts = config.logging || {};
const outputs = [];
const level = opts.level || 'info';

if (!opts.silent)
{
    if (process.env.NODE_ENV === 'dev')
    {
        let prettystream = require('bistre')({time: true});
        prettystream.pipe(process.stdout);
        outputs.push({ level:  'debug', stream: prettystream });
    }
    else
        outputs.push({level: level, stream: process.stdout});
}

bole.output(outputs);

const server = new Numbat(config);
server.listen();
