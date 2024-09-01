const path = require('path')
module.exports = {
	entry: './public/engine/eng.js',
	output: {
		filename: 'engine.js',
		path: path.resolve(__dirname, 'public/engine'),
		libraryTarget: 'module',
	},
	experiments: {
		outputModule: true,
	},
}
