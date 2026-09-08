export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const delta = Math.max(0, Date.now() - then);
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}
