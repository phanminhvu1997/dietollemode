import { json, urlencoded } from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'

const setupRootMiddleware = (app) => {
  process.env.NODE_ENV === 'development' && app.use(cors())
  process.env.NODE_ENV === 'development' && app.options('*', cors())

  // parse application/x-www-form-urlencoded
  app.use(urlencoded({ extended: false }))

  // parse application/json
  app.use(
    json({
      verify: (req, res, buf) => {
        req.rawBody = buf
      },
    })
  )

  // setup express
  app.set('trust proxy', true)

  // setup log
  app.use(morgan('short'))
}

export default setupRootMiddleware
