import { readMeta, writeMeta } from './db';
import type { Rate } from '../pricing';
import { THEMES, type Theme } from '../themes';

export type Settings = {
  theme: Theme;
  range: string;
  metric: 'tokens' | 'cost';
  scanIntervalSec: number;
  claudeWindows: boolean;
  prices: Record<string, Rate>;
  hiddenColumns: string[];
};

const DEFAULTS: Settings = {
  theme: 'auto',
  range: '30d',
  metric: 'tokens',
  scanIntervalSec: 120,
  claudeWindows: true,
  prices: {},
  hiddenColumns: []
};

const knownTheme = (value: unknown): Theme =>
  THEMES.find((theme) => theme.id === value)?.id ?? 'auto';

let cached: Settings | null = null;

export function settings(): Settings {
  if (cached) return cached;
  let stored: Partial<Settings> = {};
  try {
    stored = JSON.parse(readMeta('settings') ?? '{}');
  } catch {
    stored = {};
  }
  cached = { ...DEFAULTS, ...stored, theme: knownTheme(stored.theme) };
  return cached;
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...settings(), ...patch };
  next.theme = knownTheme(next.theme);
  writeMeta('settings', JSON.stringify(next));
  cached = next;
  return next;
}

export const priceOverrides = (): Record<string, Rate> => settings().prices;
