const {
  addWebpackAlias,
  addWebpackPlugin,
  addWebpackResolve,
  useBabelRc,
  override,
} = require('customize-cra')
const webpack = require('webpack')

const updateWebpackModuleRules = (config) => {
  const sourceMapLoader = {
    enforce: 'pre',
    exclude: /@babel(?:\/|\\{1,2})runtime/,
    test: /\.(js|m?js|jsx|ts|tsx|css|wasm)$/,
    use: [
      {
        loader: 'source-map-loader',
        options: {
          filterSourceMappingUrl: (url, resourcePath) => {
            if (/.*\/node_modules\/.*/.test(resourcePath)) {
              return false
            }
            return true
          },
        },
      },
    ],
     resolve: {
	      fullySpecified: false
     }
  }

  config.module.rules.splice(0, 1, sourceMapLoader)

  return config
}
module.exports = override(
  updateWebpackModuleRules,
  useBabelRc(),

  addWebpackPlugin(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ),
  addWebpackResolve({
    fallback: {
      url: require.resolve('url/'),
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      http: require.resolve('stream-http'),
      path: require.resolve('path-browserify'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      os: require.resolve('os-browserify/browser'),
    },
  })
)
