module.exports =
{
	logging:
	{
		name: 'numbat-1',
		silent: true,
	},
	listen:
	{
		udp:  false,
		port: 4677
	},
	outputs:
	[
		{ type: 'prettylog', name: 'numbat-1', pipe: true },
		{ type: 'influx',
			hosts:
			[
				{ host: 'localhost',  port: 8086 },
			],
			username: 'test',
			password: 'test',
			database: 'test',
			batchSize: 2,
		},
	]
};
