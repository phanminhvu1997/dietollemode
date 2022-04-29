import mongoose from 'mongoose'

console.log(process.env.MONGODB)

const connectWithRetry = function () {
  // when using with docker, at the time we up containers. Mongodb take few seconds to starting, during that time NodeJS server will try to connect MongoDB until success.
  return mongoose.connect(
    process.env.MONGODB,
    {
      promiseLibrary: Promise,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.error(
          'Failed to connect to mongo on startup - retrying in 5 sec',
          err
        )
        setTimeout(connectWithRetry, 5000)
      }
    }
  )
}
connectWithRetry()

export default mongoose
