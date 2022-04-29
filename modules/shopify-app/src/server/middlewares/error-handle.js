import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const errorHandle = async (e, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(e)
  }
  if (e.uncaughtError instanceof Joi.ValidationError) {
    return res.sendStatus(StatusCodes.BAD_REQUEST)
  }
  next(e)
}

export default errorHandle
