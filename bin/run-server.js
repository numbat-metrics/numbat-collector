#!/usr/bin/env node

var
    Numbat       = require('../index'),
    createLogger = require('../lib/logging')
    path         = require('path')
    ;

var config = require(path.resolve(process.argv[2]));
config.log = createLogger(config.logging);

var server = new Numbat(config);
server.listen();
