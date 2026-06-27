const getOrdinalSuffix = (day: number) => {
  if (day >= 11 && day <= 13) {
    return 'th'
  }

  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

const getUtcParts = (value: string) => {
  const date = new Date(value)
  const day = date.getUTCDate()
  const month = date.toLocaleString('en-GB', {
    month: 'long',
    timeZone: 'UTC',
  })
  const year = date.getUTCFullYear()

  return { day, month, year }
}

export const formatHomeDate = (value: string) => {
  const { day, month, year } = getUtcParts(value)
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`
}

export const formatBlogDate = (value: string) => {
  const { day, month, year } = getUtcParts(value)
  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`
}

export const formatIsoDate = (value: string) => {
  const date = new Date(value)
  return date.toISOString()
}
