# Numbat

[Numbat](http://www.arkive.org/numbat/myrmecobius-fasciatus/)-powered metrics system: monitoring, alerting, and historical analysis. The collector sits in front of [Numbat-Analyzer](https://github.com/ceejbot/numbat-analyzer) and [InfluxDB](http://influxdb.org/) in the same way that statsd sits in front of Graphite. This system, however, does absolutely no aggregation or manipulation of the data at all (yet). It merely multiplexes & buffers when necessary.

See [numbat-analyzer](https://github.com/ceejbot/numbat-analyzer) for more information on the system.

The collector is a service. You are intended to run it anywhere you like, perhaps many instances of it. You could run one on every hosts where you run services and communicate with it using a socket. Or you could run a few collectors and communicate using TCP or UDP.

[![npm](http://img.shields.io/npm/v/numbat-collector.svg?style=flat)](https://www.npmjs.org/package/numbat-collector) [![Tests](http://img.shields.io/travis/ceejbot/numbat-collector.svg?style=flat)](http://travis-ci.org/ceejbot/numbat-collector) ![Coverage](http://img.shields.io/badge/coverage-86%25-green.svg?style=flat)    [![Dependencies](https://david-dm.org/ceejbot/numbat-collector.svg)](https://david-dm.org/ceejbot/numbat-collector)

In production at npm.

### Running

```shell
> npm install -g numbat-collector
> numbatd configuration.js
```

The configuration file looks like this:

```javascript
module.exports =
{
    logging:
    {
        name: 'numbat-1',
        silent: false
    },
    listen: { host: 'localhost', port: 3333 },
    outputs:
    [
        { type: 'log', name: 'numbat-1', path: './numbat.log' },
        { type: 'analyzer',  host: 'localhost', port: 5555 },
        {
            type: 'influxdb',
            hosts:
            [
                { host: 'influx-1.example.com',  port: 8086 },
                { host: 'influx-2.example.com',  port: 8086 },
            ],
            username: 'numbat',
            password: 'my-top-secret',
            database: 'numbat'
        },
        { type: 'prettylog', name: 'foobar' },
    ]
};
```

The configuration options are described in more detail below.

### Logging options

* `console: true`: output to the console
* `silent: true`: no logging at all
* `NODE_ENV=dev` set in environment: log to console, pretty-printed (no need to pipe to bistre)
* `path: '/path/to/directory'`: log to a file in the given directory. The file will be named `name.log`, where 'name' is whatever you specified in that field.

### Listen options

* `listen: { host: '0.0.0.0', port: 3333 }` -- listen for incoming data over tcp on the given port
* `listen: { host: 'localhost', port: 3333, udp: true }` -- listen for udp data
* `listen: { path: '/path/to/foo.sock' }` -- connect to the given unix domain socket

## Outputs

* `influx`: [InfluxDB](http://influxdb.org/): a time-series database that can drive interesting dashboards.
* `logfile`: a json-formatted logfile (using [bole](https://github.com/rvagg/bole)); in case you want logging for any reason
* `prettylog`: a pretty-formatted colorized console log
* `analyzer`: [numbat-analyzer](https://github.com/ceejbot/numbat-analyzer), the incomplete alerting & monitoring component of the numbat-powered metrics system.
* `graphite`: Graphite
* `jut`: [Jut.io](http://www.jut.io)


## Contributing

Sure! Write tests with [Lab](https://www.npmjs.org/package/lab) & [must](https://www.npmjs.org/package/must). Use BSD/Allman bracing or I will stare at you funny and not take your pull request.

## License

[ISC](http://opensource.org/licenses/ISC)
