# Numbat

[Numbat](http://www.arkive.org/numbat/myrmecobius-fasciatus/)-powered metrics system: monitoring, alerting, and historical analysis. The collector sits in front of [Riemann](http://riemann.io) and [InfluxDB](http://influxdb.org/) in the same way that statsd sits in front of Graphite. This system, however, does absolutely no aggregation or manipulation of the data at all. It merely multiplexes & buffers when necessary.

## How to

You must previously have set up [Riemann](http://riemann.io) and [InfluxDB](http://influxdb.org/).

You can add [numbat-emitter](https://github.com/ceejbot/numbat-emitter) into any existing node program. Or you can use it in a standalone program triggered by cron. See the examples.

### Running

```shell
> npm install -g numbat-collector
> numbatd configuration.js
```

Configuration TBD but it's probably going to look like this:

```javascript
module.exports =
{
    logging:
    {
        name: 'numbat-1',
        console: true,
        path: '/var/log/numbatd'
    },
    metrics: { host: 'localhost', port: 3333 },
    admin:   { host: 'localhost', port: 3334 },
    outputs:
    [
        { type: 'riemann',  host: 'localhost',     port: 5555 },
        { type: 'influxdb', hosts: ['localhost'],  port: 8086,
        user: 'numbat',   pass: 'my-top-secret', db: 'numbat' }
    ]
};
```

## Design notes

*Numbat* is a collection of conveniences for getting interesting data from node.js services into a monitoring system and a database for historical analysis.

### collector

The collector is a service. You are intended to run it anywhere you like, perhaps many instances of it. It receives metrics, buffers, and multiplexes out to databases and to Riemann. It manages its list of clients through a tiny http admin api. You can, if you wish, send events to several instances of Riemann.

### emitter

[numbat-emitter](https://github.com/ceejbot/numbat-emitter) is a module you're intended to require anywhere you need it. Make an emitter object, hang onto it, emit metrics with it.

## TODO

Everything.

## Contributing

Sure! Write tests with [Lab](https://www.npmjs.org/package/lab) & [must](https://www.npmjs.org/package/must). Use BSD/Allman bracing or I will stare at you funny and not take your pull request.

## License

[ISC](http://opensource.org/licenses/ISC)
