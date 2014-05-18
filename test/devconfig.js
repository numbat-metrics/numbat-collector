module.exports =
{
    logging:
    {
        name: 'numbat-1',
        console: true,
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
