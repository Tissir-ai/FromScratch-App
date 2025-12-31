export function formatDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return ""

  // Normalize input to a Date instance. Many backend timestamps omit timezone
  // (e.g. "2025-12-27 10:00:00"). Treat timezone-less strings as UTC by
  // converting to ISO-like format with a trailing Z.
  let date: Date
  if (dateInput instanceof Date) {
    date = dateInput
  } else {
    let s = dateInput
    // If format is "YYYY-MM-DD HH:mm:ss" replace space with T
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
      s = s.replace(" ", "T")
    }
    // If no timezone info (no Z or +/-), append Z to treat as UTC
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
      s = s + "Z"
    }

    date = new Date(s)
  }
  const now = new Date()
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now"
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }

  // Format as date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
