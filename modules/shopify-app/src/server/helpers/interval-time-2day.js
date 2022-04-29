const DAY_OF_YEAR = 365
const DAY_OF_MONTH = 30
const DAY_OF_WEEK = 7

const intervalTimeToDays = (time, unit) => {
  if (!time || !unit) {
    return Number(time)
  }
  switch (unit) {
    case 'day':
      return Number(time)
    case 'week':
      return Number(time) * DAY_OF_WEEK
    case 'month':
      return Number(time) * DAY_OF_MONTH
    case 'year':
      return Number(time) * DAY_OF_YEAR
    default:
      return Number(time)
  }
}

export default intervalTimeToDays
