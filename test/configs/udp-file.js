module.exports =
{
	logging:
	{
		name: 'numbat-1',
		silent: false,
	},
	listen:
	{
		udp:  true,
		port: 4677
	},
	outputs:
	[
		{ type: 'logfile', name: 'numbat-1' },
	]
};
