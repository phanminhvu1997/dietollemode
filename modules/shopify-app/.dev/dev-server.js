import compression from 'compression'
import express from 'express'
import { URL } from 'url'

// webpack
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin'
import TimeFixPlugin from 'time-fix-plugin'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'

import config from './webpack.babel'

const PORT = new URL(process.env.DEV_SERVER).port
const state = {
  isStarted: false
}

const compiler = webpack(
  new SpeedMeasurePlugin({
    disable: false
  }).wrap({
    ...config,
    // mode: 'development',
    plugins: [
      new TimeFixPlugin(),
      ...config.plugins
    ]
  })
)

// init express server
const devServer = express()

devServer.get('/alive', (req, res) => res.sendStatus(204))

devServer.use(
  compression({
    level: 9
  }),
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    watchOption: {
      ignore: /node_modules/,
      aggregateTimeout: 10e3
    },
    // logLevel: 'warn',
    writeToDisk: true
  })
)

// start dev-server when bundling finishes
compiler.hooks.done.tap('done', () => {
  if (state.isStarted) {
    return
  }

  devServer.listen(PORT, () => {
    state.isStarted = true

    console.log(`dev-server started at: ${PORT}`)
  })
})
