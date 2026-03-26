import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import isYesterday from 'dayjs/plugin/isYesterday'

// Extend dayjs with plugins
dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.extend(isToday)
dayjs.extend(isTomorrow)
dayjs.extend(isYesterday)

export { dayjs }

// Helper functions for common date operations

/**
 * Format a date for display (e.g., "Mon, Jan 15, 2024")
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return 'No due date'
  return dayjs(date).format('ddd, MMM D, YYYY')
}

/**
 * Format a date with full weekday (e.g., "Monday, January 15, 2024")
 */
export function formatDateLong(date: string | Date | null): string {
  if (!date) return 'No due date'
  return dayjs(date).format('dddd, MMMM D, YYYY')
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow()
}

/**
 * Format a date for calendar context (e.g., "Today", "Yesterday", "Last Monday")
 */
export function formatCalendarDate(date: string | Date | null): string {
  if (!date) return 'No due date'
  const d = dayjs(date)

  if (d.isToday()) return 'Today'
  if (d.isYesterday()) return 'Yesterday'
  if (d.isTomorrow()) return 'Tomorrow'

  // If within the last week
  const now = dayjs()
  const diffDays = now.diff(d, 'day')

  if (diffDays > 0 && diffDays < 7) {
    return `${diffDays} days ago`
  }

  if (diffDays < 0 && diffDays > -7) {
    return `in ${Math.abs(diffDays)} days`
  }

  // Otherwise show the date
  return d.format('MMM D, YYYY')
}

/**
 * Check if a date is overdue (before today)
 */
export function isOverdue(
  date: string | Date | null,
  status?: string,
): boolean {
  if (!date || status === 'completed') return false
  return dayjs(date).startOf('day').isBefore(dayjs().startOf('day'))
}

/**
 * Check if a date is due today
 */
export function isDueToday(date: string | Date | null): boolean {
  if (!date) return false
  return dayjs(date).isToday()
}

/**
 * Check if a date is due this week
 */
export function isDueThisWeek(date: string | Date | null): boolean {
  if (!date) return false
  const d = dayjs(date)
  const now = dayjs()
  const startOfWeek = now.startOf('week')
  const endOfWeek = now.endOf('week')
  return d.isAfter(startOfWeek) && d.isBefore(endOfWeek)
}

/**
 * Format a short relative time for compact display (e.g., "2h", "3d", "1w")
 */
export function formatShortRelativeTime(date: string | Date): string {
  const d = dayjs(date)
  const now = dayjs()
  const diffMinutes = now.diff(d, 'minute')
  const diffHours = now.diff(d, 'hour')
  const diffDays = now.diff(d, 'day')
  const diffWeeks = now.diff(d, 'week')

  if (diffMinutes < 1) return 'now'
  if (diffMinutes < 60) return `${diffMinutes}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  if (diffWeeks < 4) return `${diffWeeks}w`

  return d.format('MMM D')
}

/**
 * Format a date for form display (PPP format like date-fns)
 */
export function formatPPP(date: Date | null): string {
  if (!date) return ''
  return dayjs(date).format('MMMM D, YYYY')
}
