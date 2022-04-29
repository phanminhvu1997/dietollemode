import crypto from 'crypto'

const randomString = () => {
  return crypto.randomBytes(16).toString('hex')
}

const createKey = ({ privateKey }) => {
  const randomStr = randomString()
  const key = crypto
    .createHash('md5')
    .update(`${ privateKey }${ randomStr }`)
    .digest('hex')

  return key
}

export {
  randomString,
  createKey,
}
