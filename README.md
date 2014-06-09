# Numbat

[Numbat](http://www.arkive.org/numbat/myrmecobius-fasciatus/)-powered metrics system: monitoring, alerting, and historical analysis. The collector sits in front of [Numbat-Analyzer](https://github.com/ceejbot/numbat-analyzer) and [InfluxDB](http://influxdb.org/) in the same way that statsd sits in front of Graphite. This system, however, does absolutely no aggregation or manipulation of the data at all (yet). It merely multiplexes & buffers when necessary.

See [numbat-analyzer](https://github.com/ceejbot/numbat-analyzer) for more information on the system.

The collector is a service. You are intended to run it anywhere you like, perhaps many instances of it. You could run one on every hosts where you run services and communicate with it using a socket. Or you could run a few collectors and communicate using TCP.

[![Tests](http://img.shields.io/travis/ceejbot/numbat-collector.svg?style=flat)](http://travis-ci.org/ceejbot/numbat-collector)
[![Dependencies](https://david-dm.org/ceejbot/numbat-collector.svg)](https://david-dm.org/ceejbot/numbat-collector)
[![NPM](https://nodei.co/npm/numbat-collector.png)](https://nodei.co/npm/numbat-collector/)

Definitely pre 1.0; many error cases unhandled as yet.

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
        console: true,
        path: '/var/log/numbatd'
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
        }
    ]
};
```

## Outputs

* [InfluxDB](http://influxdb.org/): a time-series database that can drive interesting dashboards.
* [numbat-analyzer](https://github.com/ceejbot/numbat-analyzer): the alerting & monitoring component of the numbat-powered metrics system.
* a json-formatted logfile (using [bole](https://github.com/rvagg/bole)); in case you want logging for any reason

## Contributing

Sure! Write tests with [Lab](https://www.npmjs.org/package/lab) & [must](https://www.npmjs.org/package/must). Use BSD/Allman bracing or I will stare at you funny and not take your pull request.

## License

[ISC](http://opensource.org/licenses/ISC)
