module.exports =
{
	logging:
	{
		name: 'numbat-1',
		silent: true,
	},
	listen: { port: 4677 },
	outputs:
	[
		{ type: 'analyzer',  host: 'localhost', port: 3337 },
		{ type: 'prettylog', name: 'numbat-1', pipe: true },
	]
};
