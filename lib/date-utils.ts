/**
 * Parses an ISO date string (e.g. "2025-09-02") and returns a Date at local midnight.
 * Prevents the dreaded "one day off" bug caused by UTC → local timezone conversion.
 */
export const parseLocalDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  // month is 0-based in JS Date constructor
  return new Date(year, month - 1, day)
}

/**
 * Optional: format a date for display if you ever need it elsewhere
 */
export const formatDisplayDate = (dateStr: string | null, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!dateStr) return '—'
  const date = parseLocalDate(dateStr)
  return date ? date.toLocaleDateString('en-US', options) : '—'
}
