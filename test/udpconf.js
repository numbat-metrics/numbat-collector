module.exports =
{
    logging:
    {
        name: 'numbat-1',
        console: true,
    },
    listen:
    {
        udp:  true,
        port: 4677
    },
    outputs:
    [
        { type: 'log', name: 'numbat-1', console: true },
    ]
};
