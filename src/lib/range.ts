export const RANGES = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
  { id: '1y', label: '12 months', days: 365 },
  { id: 'all', label: 'All time', days: 0 }
] as const;

export type RangeId = (typeof RANGES)[number]['id'];

export const rangeLabel = (id: string) =>
  RANGES.find((range) => range.id === id)?.label ?? '30 days';

/** Whole local days, so the daily charts and the totals above them agree. */
export function resolveRange(id: string, now = Date.now()) {
  const range = RANGES.find((entry) => entry.id === id) ?? RANGES[2];
  const to = now;
  if (!range.days) return { from: 0, to, range: range.id };

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (range.days - 1));
  return { from: start.getTime(), to, range: range.id };
}
