module.exports =
{
    logging:
    {
        name: 'numbat-1',
        console: true,
    },
    listen: { path: '/tmp/numbat.sock' },
    outputs:
    [
        { type: 'analyzer',  host: 'localhost', port: 3337 },
        { type: 'log', name: 'numbat-1', path: './numbat.log' },
        { type: 'influxdb', hosts: ['localhost'],  port: 8086,
        user: 'numbat',   pass: 'my-top-secret', db: 'numbat' }
    ]
};
