import { readMeta, writeMeta } from './db';
import type { Rate } from '../pricing';

export type Settings = {
  theme: 'auto' | 'light' | 'dark';
  range: string;
  metric: 'tokens' | 'cost';
  scanIntervalSec: number;
  claudeWindows: boolean;
  prices: Record<string, Rate>;
};

const DEFAULTS: Settings = {
  theme: 'auto',
  range: '30d',
  metric: 'tokens',
  scanIntervalSec: 120,
  claudeWindows: true,
  prices: {}
};

let cached: Settings | null = null;

export function settings(): Settings {
  if (cached) return cached;
  let stored: Partial<Settings> = {};
  try {
    stored = JSON.parse(readMeta('settings') ?? '{}');
  } catch {
    stored = {};
  }
  cached = { ...DEFAULTS, ...stored };
  return cached;
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const next = { ...settings(), ...patch };
  writeMeta('settings', JSON.stringify(next));
  cached = next;
  return next;
}

export const priceOverrides = (): Record<string, Rate> => settings().prices;
