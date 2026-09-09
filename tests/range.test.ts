import { describe, expect, it } from 'vitest';
import { resolveRange } from '../src/lib/range';

const now = new Date(2026, 8, 9, 14, 30).getTime();

describe('ranges', () => {
  it('starts a multi-day range at midnight, so the daily chart and the totals agree', () => {
    const { from } = resolveRange('7d', now);
    const start = new Date(from);

    expect(start.getHours()).toBe(0);
    expect(start.getDate()).toBe(3);
  });

  it('counts today as one of the days', () => {
    expect(new Date(resolveRange('today', now).from).getDate()).toBe(9);
  });

  it('reaches back to nothing for all time', () => {
    expect(resolveRange('all', now).from).toBe(0);
  });

  it('falls back to a sensible default for a range it does not know', () => {
    expect(resolveRange('last-tuesday', now).range).toBe('30d');
  });
});
