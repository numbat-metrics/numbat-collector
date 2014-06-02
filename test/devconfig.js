module.exports =
{
    logging:
    {
        name: 'numbat-1',
        console: true,
    },
    incoming: { path: '/tmp/numbat.sock' },
    admin:   { host: 'localhost', port: 3336 },
    outputs:
    [
        { type: 'analyzer',  host: 'localhost', port: 3337 },
        { type: 'log', name: 'numbat-1', path: './numbat.log' },
        { type: 'influxdb', hosts: ['localhost'],  port: 8086,
        user: 'numbat',   pass: 'my-top-secret', db: 'numbat' }
    ]
};
