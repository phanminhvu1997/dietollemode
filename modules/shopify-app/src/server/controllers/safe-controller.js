function makeSafe(func) {
  return async function(...args) {
    try {
      await func(...args)
    } catch (e) {
      const next = args.length === 4 ? args[3] : args[2]

      next({
        uncaughtError: e
      })
    }
  }
}

export default function createSafeController(controller) {
  return Object.entries(controller)
    .reduce((safe, [ name, func ]) => {
      return {
        ...safe,
        [name]: makeSafe(func)
      }
    }, {})
}
