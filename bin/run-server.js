#!/usr/bin/env node

var
	Numbat  = require('../index'),
	logging = require('../lib/logging'),
	path    = require('path')
	;

var config = require(path.resolve(process.argv[2]));
logging(config.logging);

var server = new Numbat(config);
server.listen();
