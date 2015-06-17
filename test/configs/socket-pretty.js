module.exports =
{
	logging:
	{
		name: 'numbat-1',
		silent: true,
	},
	listen:
	{
		path:  '/tmp/numbat.sock',
	},
	outputs:
	[
		{ type: 'prettylog', name: 'numbat-1', pipe: true },
	]
};
