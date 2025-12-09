import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats a date into a relative time string like "2 minutes ago".
// Uses Intl.RelativeTimeFormat with a fallback for very recent times.
export function formatRelativeTime(date: Date, nowMs?: number): string {
  const now = nowMs ?? Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  // Under 10 seconds -> just now
  if (diffSec < 10) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  // Determine unit boundaries
  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return rtf.format(-diffHour, 'hour');
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return rtf.format(-diffDay, 'day');
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return rtf.format(-diffWeek, 'week');
  const diffMonth = Math.floor(diffDay / 30.4375); // average days per month
  if (diffMonth < 12) return rtf.format(-diffMonth, 'month');
  const diffYear = Math.floor(diffDay / 365.25);
  return rtf.format(-diffYear, 'year');
}
