# Numbat

[Numbat](http://www.arkive.org/numbat/myrmecobius-fasciatus/)-Powered Metrics system: monitoring, alerting, and historical analysis. The collector sits in front of [Numbat-Analyzer](https://github.com/numbat-metrics/numbat-analyzer) and [InfluxDB](http://influxdb.org/) in the same way that statsd sits in front of Graphite. This system, however, does absolutely no aggregation or manipulation of the data at all (yet). It merely multiplexes & buffers when necessary.

See [numbat-analyzer](https://github.com/numbat-metrics/numbat-analyzer) for more information on the system.

The collector is a service. You are intended to run it anywhere you like, perhaps many instances of it. You could run one on every hosts where you run services and communicate with it using a socket. Or you could run a few collectors and communicate using TCP or UDP.

[![npm](http://img.shields.io/npm/v/numbat-collector.svg?style=flat)](https://www.npmjs.org/package/numbat-collector) [![Tests](http://img.shields.io/travis/numbat-metrics/numbat-collector.svg?style=flat)](http://travis-ci.org/numbat-metrics/numbat-collector) ![Coverage](http://img.shields.io/badge/coverage-86%25-green.svg?style=flat)    [![Dependencies](https://david-dm.org/numbat-metrics/numbat-collector.svg)](https://david-dm.org/numbat-metrics/numbat-collector)

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
        { type: 'jut', target: 'http://uri-of-collector', batchSize: 500 },
        { type: 'graphite', host: 'localhost', port: 3333 },
    ]
};
```

The configuration options are described in more detail below.

### Logging options

Logs JSON-formatted data to the console by default.

* `name: nodename`: name to tag all log entries with
* `silent: true`: no logging at all
* `NODE_ENV=dev` set in environment: log to console, pretty-printed (no need to pipe to bistre)

### Listen options

* `listen: { host: '0.0.0.0', port: 3333 }` -- listen for incoming data over tcp on the given port
* `listen: { host: 'localhost', port: 3333, udp: true }` -- listen for udp data
* `listen: { path: '/path/to/foo.sock' }` -- connect to the given unix domain socket
* `listen: { host: '0.0.0.0', port: 3333, ws: true }` -- listen for incoming data over a websocket on the given port

These options are mutually exclusive.

### Websocket specific options

Some running environments restrict the use of raw TCP or UDP sockets. In those situations you might use the websocket transport option instead. For example, certain PaaS providers restrict this. Use this for server-to-server communication, not browser-to-server communication.

The websocket listener obeys these listener options:

When using the websocket option, the following additional parameters can be provided on the listener:

* `pathname` -- the path the websocket should be exposed at - default: '/'
* `keepAliveFrequency` -- how often in milliseconds the server and client should exchange keep alive messages - default: 3000
* `keepAliveThreshold` -- how many keep alive messages to be dropped before the socket connection is reset - default: 2
* `verifyClient` -- a custom function to validate client access [example](https://gist.github.com/trygve-lie/dbfee0d0886dde532b01) - default: no validation

## Outputs

* `influx`: [InfluxDB 0.8](http://influxdb.org/): a time-series database that can drive interesting dashboards.
* `influx9`: InfluxDB 0.9, client provided by the [numbat-influx](https://github.com/numbat-metrics/numbat-influx) module
* `logfile`: a json-formatted logfile (using [bole](https://github.com/rvagg/bole)); in case you want logging for any reason
* `prettylog`: a pretty-formatted colorized console log
* `analyzer`: [numbat-analyzer](https://github.com/numbat-metrics/numbat-analyzer), the incomplete alerting & monitoring component of the numbat-powered metrics system.
* `graphite`: Graphite (plain graphite, not statsd)
* `jut`: [Jut.io](http://www.jut.io)

You can have as many outputs as you want.

## Contributing

Yes, please do! See our [contributing guide](https://github.com/numbat-metrics/documentation/blob/master/contributing.md) for basic rules of engagement.

## License

[ISC](http://opensource.org/licenses/ISC)
