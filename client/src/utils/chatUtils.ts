/**
 * Localized date formatters
 */
export const dayFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Threshold for grouping messages from the same author (5 minutes)
 */
export const COMPACT_THRESHOLD_MS = 5 * 60 * 1000

/**
 * Returns a string representing YYYY-MM-DD for date comparison.
 */
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

/**
 * Returns a human-friendly label for a message date.
 */
export const getDayLabel = (value: string) => {
  const date = new Date(value)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (toDateKey(date) === toDateKey(today)) return 'Dzisiaj'
  if (toDateKey(date) === toDateKey(yesterday)) return 'Wczoraj'

  return dayFormatter.format(date)
}

/**
 * Extracts up to two initials from a nickname.
 */
export const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
