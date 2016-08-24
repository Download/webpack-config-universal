var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var root = path.resolve(require('app-root-path').toString());

/**
* gencfg(type, env)
*
* A Webpack config generator for isomorphic / universal apps.
*
* @param type  Optional String specifying the type of config to generate, either
*              `'client'` or `'server'`. If not specified, will use the `BUILD_TYPE`
*              environment variable if set, otherwise defaults to `'server'`.
* @param env   Optional String specifying the flavor of config to generate, either
*              `'development'` or `'production'`. If not specified, will use the
*              `NODE_ENV` environment variable if set, otherwise defaults to `'production'`.
*/
module.exports = function gencfg(type, env) {
	var typ = type || process.env.BUILD_TYPE || 'server'
	env = env || process.env.NODE_ENV || 'production'

	return {
		// The base directory (absolute path!) for resolving the entry option.
		// If output.pathinfo is set, the included pathinfo is shortened to this directory.
		context: path.resolve(root, 'src'),

		// The entry point for the bundle.
		// If you pass a string: The string is resolved to a module which is loaded upon startup.
		// If you pass an array: All modules are loaded upon startup. The last one is exported.
		entry: (
      env != 'production' ?
        (typ == 'server' ? [
          // Webpack hot reloading you can attach to your own server
          // https://github.com/glenjamin/webpack-hot-middleware
          'webpack-hot-middleware/client',
        ] : [
    			// Webpack's polling-based HMR runtime with a pol interval of 1000ms
    			'webpack/hot/poll?1000',
        ])
      : [ // env == 'production', no extra entries added
      ]
    ).concat(
      // Main entry is last so it gets exported
      ['./' + typ]
    ),

		resolve: {
			// IMPORTANT: Setting this option will override the default, meaning that webpack
			// will no longer try to resolve modules using the default extensions. If you want
			// modules that were required with their extension (e.g. require('./somefile.ext'))
			// to be properly resolved, you must include an empty string in your array.
			// Similarly, if you want modules that were required without extensions (e.g.
			// require('underscore')) to be resolved to files with “.js” extensions, you must
			// include ".js" in your array.
			// Default: ["", ".webpack.js", ".web.js", ".js"]
			// https://webpack.github.io/docs/configuration.html#resolve-extensions
			extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
		},

		// Specify dependencies that shouldn’t be resolved by webpack, but should
		// become dependencies of the resulting bundle.
		// The kind of the dependency depends on output.libraryTarget.
		// https://webpack.github.io/docs/configuration.html#externals
		externals: typ == 'server' ? gen : {},

		// Options affecting the normal modules (NormalModuleFactory)
		// https://webpack.github.io/docs/configuration.html#module
		module: {
			// Syntax like module.loaders.
			// An array of applied pre and post loaders.
			// https://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
			preLoaders: [
				// json loader for webpack
				// https://github.com/webpack/json-loader
				{test: /\.json$/, exclude: /node_modules/, loader: 'json'},
			],

			// An array of automatically applied loaders.
			// Each item can have these properties:
			// test: A condition that must be met
			// exclude: A condition that must not be met
			// include: A condition that must be met
			// loader: A string of “!” separated loaders
			// loaders: An array of loaders as string
			// https://webpack.github.io/docs/configuration.html#module-loaders
			loaders: [
				// Webpack plugin for Babel
				// https://github.com/babel/babel-loader
				{test: /\.jsx$/, exclude: /node_modules/, loader: 'babel',
					query: {
						cacheDirectory: true,
						plugins: env != 'production' && typ == 'server' ? ['transform-runtime'] : [],
					},
				},
			],

			// A RegExp or an array of RegExps. Don’t parse files matching.
			// It’s matched against the full resolved request.
			// This can boost the performance when ignoring big libraries.
			// https://webpack.github.io/docs/configuration.html#module-noparse
			noParse: /\.min\.js/,
		},

		// Compilation target. Possible values:
		// "web" Compile for usage in a browser-like environment (default)
		// "webworker" Compile as WebWorker
		// "node" Compile for usage in a node.js-like environment (use require to load chunks)
		// "async-node" Compile for usage in a node.js-like environment (use fs and vm to load chunks async)
		// "node-webkit" Compile for usage in webkit, uses jsonp chunk loading but also supports builtin node.js modules plus require(“nw.gui”) (experimental)
		// "atom" Compile for usage in electron (formerly known as atom-shell), supports require for modules necessary to run Electron.
		// https://webpack.github.io/docs/configuration.html#target
		target: typ == 'server' ? 'node' : 'web',

		// Include polyfills or mocks for various node stuff:
		// console: true or false
		// global: true or false
		// process: true, "mock" or false
		// Buffer: true or false
		// __filename: true (real filename), "mock" ("/index.js") or false
		// __dirname: true (real dirname), "mock" ("/") or false
		// <node buildin>: true, "mock", "empty" or false
		// https://webpack.github.io/docs/configuration.html#node
		node: typ == 'server' ? {__dirname:true, __filename:true} : undefined,

		// Options affecting the output.
		// If you use any hashing ([hash] or [chunkhash]) make sure to have a
		// consistent ordering of modules. Use the OccurenceOrderPlugin or recordsPath.
		// https://webpack.github.io/docs/configuration.html#output
		output: {
			// The output directory as absolute path (required).
			// [hash] is replaced by the hash of the compilation.
			// https://webpack.github.io/docs/configuration.html#output-path
			path: typ == 'server' ? root : path.resolve(root, 'public'),

			// The filename of the entry chunk as relative path inside the output.path directory.
			// [name] is replaced by the name of the chunk.
			// [hash] is replaced by the hash of the compilation.
			// [chunkhash] is replaced by the hash of the chunk.
			// ! You must not specify an absolute path here! Use the output.path option.
			// https://webpack.github.io/docs/configuration.html#output-filename
			filename: typ + '.js',

			// The publicPath specifies the public URL address of the output files
			// when referenced in a browser.
			// https://webpack.github.io/docs/configuration.html#output-publicpath
			publicPath: typ != 'server' ? '/' : undefined,

			// Which format to export the library:
			// "var" - Export by setting a variable: var Library = xxx (default)
			// "this" - Export by setting a property of this: this["Library"] = xxx
			// "commonjs" - Export by setting a property of exports: exports["Library"] = xxx
			// "commonjs2" - Export by setting module.exports: module.exports = xxx
			// "amd" - Export to AMD (optionally named - set the name via the library option)
			// "umd" - Export to AMD, CommonJS2 or as property in root
			libraryTarget: typ == 'server' ? 'commonjs2' : undefined,

			// The filename of the Hot Update Main File. It is inside the output.path directory.
			// [hash] is replaced by the hash of the compilation. (The last hash stored in the records)
			// Default: "[hash].hot-update.json"
			// https://webpack.github.io/docs/configuration.html#output-hotupdatemainfilename
			hotUpdateMainFilename: 'hmr/[hash]/hot-update.json',

			// The filename of the Hot Update Chunks. They are inside the output.path directory.
			// [id] is replaced by the id of the chunk.
			// [hash] is replaced by the hash of the compilation. (The last hash stored in the records)
			// Default: "[id].[hash].hot-update.js"
			// https://webpack.github.io/docs/configuration.html#output-hotupdatechunkfilename
			hotUpdateChunkFilename: 'hmr/[hash]/hot-update-chunk-[id].js',

			// Include comments with information about the modules.
			//   require(/* ./test */23)
			// Do not use this in production.
			// https://webpack.github.io/docs/configuration.html#output-pathinfo
			pathinfo: env != 'production',
		},

		// Choose a developer tool to enhance debugging.
		// "eval" - Each module is executed with eval and //@ sourceURL.
		// "source-map" - A SourceMap is emitted. See also output.sourceMapFilename.
		// "hidden-source-map" - Same as source-map, but doesn’t add a reference comment to the bundle.
		// "inline-source-map" - A SourceMap is added as DataUrl to the JavaScript file.
		// "eval-source-map" - Each module is executed with eval and a SourceMap is added as DataUrl to the eval.
		// "cheap-source-map" - A SourceMap without column-mappings. SourceMaps from loaders are not used.
		// "cheap-module-source-map" - A SourceMap without column-mappings. SourceMaps from loaders are simplified to a single mapping per line.
		// Prefixing @, # or #@ will enforce a pragma style. (Defaults to #, recommended)	devtool: 'source-map',
		// https://webpack.github.io/docs/configuration.html#devtool
		devtool: env != 'production' ? 'cheap-module-eval-source-map' : 'source-map',

		// Can be used to configure the behaviour of webpack-dev-server
		// when the webpack config is passed to webpack-dev-server CLI.
		// https://webpack.github.io/docs/configuration.html#devserver
		devServer: {
			stats: {
				colors:true,
				chunks:false,
				hash:false,
				version:false,
			}
		},

		// Add additional plugins to the compiler.
		// https://webpack.github.io/docs/configuration.html#plugins
		plugins: [
			// OccurenceOrderPlugin(preferEntry)
			// Assign the module and chunk ids by occurrence count. Ids that are used often get lower (shorter) ids.
			// This make ids predictable, reduces to total file size and is recommended.
			//  `preferEntry` (boolean) give entry chunks higher priority. This makes entry chunks smaller
			//                but increases the overall size. (recommended)
			new webpack.optimize.OccurenceOrderPlugin(true),
		].concat(
      env != 'production' ? (
        typ == 'server' ? [
          // BannerPlugin(banner, options)
    			// Adds a banner to the top of each generated chunk.
    			//  `banner` a string, it will be wrapped in a comment
    			//  `options` an optional options object:
    			//    `options.raw` if true, banner will not be wrapped in a comment
    			//    `options.entryOnly` if true, the banner will only be added to the entry chunks.
    			// https://webpack.github.io/docs/list-of-plugins.html#bannerplugin
    			new webpack.BannerPlugin('require("source-map-support").install();', {raw:true, entryOnly:true}),
        ]
        : [ // typ != 'server'

        ]
      ).concat(
        [
          // HotModuleReplacementPlugin()
      		// Enables Hot Module Replacement. (This requires records data if not in dev-server mode, recordsPath)
      		// Generates Hot Update Chunks of each chunk in the records. It also enables the API and makes __webpack_hash__
      		// available in the bundle.
      		// ! Only add HotModuleReplacementPlugin here when you don't use cmd line option --hot
      		// because it will break if we add both! see https://github.com/webpack/webpack/issues/1830
      		// https://webpack.github.io/docs/list-of-plugins.html#hotmodulereplacementplugin
      		new webpack.HotModuleReplacementPlugin(),

      		// NoErrorsPlugin()
      		// When there are errors while compiling this plugin skips the emitting phase
      		// (and recording phase), so there are no assets emitted that include errors.
      		// The emitted flag in the stats is false for all assets. If you are using the
      		// CLI, the webpack process will not exit with an error code by enabling this plugin.
      		// If you want webpack to "fail" when using the CLI, please check out the bail option.
      		// https://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      		new webpack.NoErrorsPlugin(),
        ]
      )
      : ( // env == 'production'
        [
          // DedupePlugin()
      		// Search for equal or similar files and deduplicate them in the output.
      		// This comes with some overhead for the entry chunk, but can reduce file size effectively.
      		// Note: Don’t use it in watch mode. Only for production builds.
      		// https://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      		new webpack.optimize.DedupePlugin(),

      		// DefinePlugin(definitions)
      		// The DefinePlugin allows you to create global constants which can be configured at compile time.
      		// https://webpack.github.io/docs/list-of-plugins.html#defineplugin
      		new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}),

      		// UglifyJsPlugin([options])
      		// Minimize all JavaScript output of chunks. Loaders are switched into minimizing mode.
      		// You can pass an object containing UglifyJS options.
      		// see https://github.com/mishoo/UglifyJS2#usage
      		// https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
      		new webpack.optimize.UglifyJsPlugin({
      			sourceMap: false,
      			// By default the mangle option is on. But you can configure the plugin
      			// to avoid mangling specific variable names by passing an except list
      			mangle: {
      				except: []
      			},
      		}),
        ]
      )
    ),
	}

	// generates externals based on contents of node_modules folder
	function gen(dir, mod, cb) {(dir.indexOf('node_modules') !== -1) || (mod.indexOf('.') !== 0) ? cb(null, 'commonjs2 ' + mod) : cb()}
}
