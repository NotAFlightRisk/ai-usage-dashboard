const UNITS = [
  { at: 1e12, suffix: 'T' },
  { at: 1e9, suffix: 'B' },
  { at: 1e6, suffix: 'M' },
  { at: 1e3, suffix: 'k' }
];

export function compact(value: number): string {
  const size = UNITS.find((unit) => Math.abs(value) >= unit.at);
  if (!size) return String(Math.round(value));
  const scaled = value / size.at;
  return `${scaled.toFixed(scaled < 10 ? 1 : 0)}${size.suffix}`;
}

export const full = (value: number) => Math.round(value).toLocaleString('en-GB');

export function money(value: number | null): string {
  if (value === null) return '--';
  if (value === 0) return '$0';
  if (Math.abs(value) < 0.01) return '<$0.01';
  return `$${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function moneyCompact(value: number | null): string {
  if (value === null) return '--';
  if (Math.abs(value) >= 1000) return `$${compact(value)}`;
  return money(value);
}

export const percent = (value: number, digits = 0) => `${value.toFixed(digits)}%`;

const RELATIVE = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });

const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 60],
  ['minute', 60],
  ['hour', 24],
  ['day', 7],
  ['week', 4.35],
  ['month', 12]
];

export function relative(at: number, now = Date.now()): string {
  if (!at) return 'never';
  let gap = (at - now) / 1000;
  if (Math.abs(gap) < 45) return gap < 0 ? 'just now' : 'in a moment';

  for (const [unit, span] of STEPS) {
    if (Math.abs(gap) < span) return RELATIVE.format(Math.round(gap), unit);
    gap /= span;
  }
  return RELATIVE.format(Math.round(gap), 'year');
}

export const dayLabel = (day: string) =>
  new Date(`${day}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

export const clockLabel = (at: number) =>
  new Date(at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

export function duration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return 'under a minute';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/** Directories are shown by their last segment, with the full path in the tooltip. */
export const projectName = (path: string) =>
  path ? path.replace(/\/+$/, '').split('/').pop() || path : 'unknown';

export const modelName = (model: string) =>
  model.includes('/') ? model.slice(model.indexOf('/') + 1) : model;

export function delta(now: number, before: number): { text: string; tone: string } | null {
  if (!before) return null;
  const change = ((now - before) / before) * 100;
  if (!Number.isFinite(change) || Math.abs(change) < 1) return { text: 'flat', tone: 'even' };
  return {
    text: `${change > 0 ? '+' : ''}${change.toFixed(0)}%`,
    tone: change > 0 ? 'up' : 'down'
  };
}
