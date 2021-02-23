module.exports = {
  presets: [
    '@babel/preset-env'
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    'transform-promise-to-bluebird',
    ['module-resolver', {
      alias: {
        '@app': './src/app',
        '@core': './src/core'
      }
    }]
  ]
}
