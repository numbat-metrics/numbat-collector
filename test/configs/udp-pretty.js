module.exports =
{
	logging:
	{
		name: 'numbat-1',
		silent: true,
	},
	listen:
	{
		udp:  true,
		port: 4677
	},
	outputs:
	[
		{ type: 'prettylog', name: 'numbat-1', pipe: true },
	]
};
