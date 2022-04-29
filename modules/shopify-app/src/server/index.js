import ect from 'ect'
import express from 'express'
import path from 'path'

import initAsset from './init-asset'
import initRouting from './init-routing'
import setupRootMiddleware from './middlewares/setup'

const PORT = process.env.PORT

const main = async () => {
  const app = express()
  setupRootMiddleware(app)

  // setup view engine
  const viewDir = path.resolve(__dirname, '../../.dist')
  app.set('views', viewDir)
  app.set('view engine', 'ect')
  app.engine(
    'ect',
    ect({
      watch: true,
      root: viewDir,
      ext: '.ect',
    }).render
  )

  // routing section
  initAsset(app)
  initRouting(app)

  // start application
  app.listen(PORT, () => {
    console.log(`\n\nStarted at: http://localhost:${PORT} \n\n`)
  })
}

main()
