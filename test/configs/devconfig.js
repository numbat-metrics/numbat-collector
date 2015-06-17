module.exports =
{
	logging:
	{
		name: 'numbat-1',
		silent: false,
	},
	listen: { path: '/tmp/numbat.sock' },
	outputs:
	[
		{ type: 'analyzer',  host: 'localhost', port: 3337 },
		{ type: 'log', name: 'numbat-1', path: './numbat.log' },
		{ type: 'influxdb', hosts: [ { host: 'localhost',  port: 8086 }],
			username: 'numbat', password: 'my-top-secret', database: 'numbat' }
	]
};
