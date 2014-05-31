# Numbat

[Numbat](http://www.arkive.org/numbat/myrmecobius-fasciatus/)-powered metrics system: monitoring, alerting, and historical analysis. The collector sits in front of [Numbat-Analyzer](https://github.com/ceejbot/numbat-analyzer) and [InfluxDB](http://influxdb.org/) in the same way that statsd sits in front of Graphite. This system, however, does absolutely no aggregation or manipulation of the data at all. It merely multiplexes & buffers when necessary.

The collector is a service. You are intended to run it anywhere you like, perhaps many instances of it. It receives metrics, buffers, and multiplexes out to databases and to the numbat analyzer/alert service. It manages its list of clients through a tiny http admin api.

See [numbat-analyzer](https://github.com/ceejbot/numbat-analyzer) for more information on the system.

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
    metrics: { host: 'localhost', port: 3333 },
    admin:   { host: 'localhost', port: 3334 },
    outputs:
    [
        { type: 'log', name: 'numbat-1', path: './numbat.log' },
        { type: 'analyzer',  host: 'localhost', port: 5555 },
        { type: 'influxdb', hosts: ['localhost'],  port: 8086,
        user: 'numbat',   pass: 'my-top-secret', db: 'numbat' }
    ]
};
```

## Outputs

* [InfluxDB](http://influxdb.org/)
* [numbat-analyzer](https://github.com/ceejbot/numbat-analyzer)
* a json-formatted logfile (using [bole](https://github.com/rvagg/bole))

## Contributing

Sure! Write tests with [Lab](https://www.npmjs.org/package/lab) & [must](https://www.npmjs.org/package/must). Use BSD/Allman bracing or I will stare at you funny and not take your pull request.

## License

[ISC](http://opensource.org/licenses/ISC)
