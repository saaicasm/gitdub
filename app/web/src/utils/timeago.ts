export function formatTimeAgo(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  const nowMs = Date.now();
  const targetMs = target.getTime();
  const diffMs = nowMs - targetMs;

  if (diffMs < 0) return "in the future";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (hours < 1) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
  if (days < 30) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  if (days < 365) return months === 1 ? "1 month ago" : `${months} months ago`;
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function formatNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1000000) {
    const k = Math.floor(n / 100) / 10;
    return k % 1 === 0 ? `${Math.floor(k)}k` : `${k}k`;
  }
  const m = Math.floor(n / 100000) / 10;
  return m % 1 === 0 ? `${Math.floor(m)}M` : `${m}M`;
}
