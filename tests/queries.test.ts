import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import type { DatabaseSync } from 'node:sqlite';
import type { Filters } from '../src/lib/types';

process.env.AIUSAGE_DB = join(mkdtempSync(join(tmpdir(), 'aiusage-')), 'usage.db');

const DAY = 86_400_000;
const now = Date.UTC(2026, 8, 9, 12, 0, 0);

let handle: DatabaseSync;
let usage: typeof import('../src/lib/server/queries').usage;
let localDay: typeof import('../src/lib/server/scan').localDay;

const add = (
  id: string,
  tool: string,
  model: string,
  project: string,
  daysAgo: number,
  tokens: number
) => {
  const at = new Date(now - daysAgo * DAY);
  handle
    .prepare(
      'insert into events (id, tool, model, session, project, ts, day, dow, hour, input, output,' +
        ' cache_read, cache_write, reasoning) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0)'
    )
    .run(
      id,
      tool,
      model,
      `session-${id}`,
      project,
      at.getTime(),
      localDay(at),
      at.getDay(),
      at.getHours(),
      tokens
    );
};

const filters = (over: Partial<Filters> = {}): Filters => ({
  from: now - 7 * DAY,
  to: now + DAY,
  range: '7d',
  tools: [],
  models: [],
  projects: [],
  ...over
});

beforeAll(async () => {
  handle = (await import('../src/lib/server/db')).db();
  ({ usage } = await import('../src/lib/server/queries'));
  ({ localDay } = await import('../src/lib/server/scan'));

  add('a', 'claude-code', 'claude-opus-5', '/work/one', 1, 1_000_000);
  add('b', 'claude-code', 'claude-opus-5', '/work/two', 2, 2_000_000);
  add('c', 'codex', 'gpt-5.6-sol', '/work/one', 3, 4_000_000);
  add('d', 'codex', 'a-model-nobody-priced', '/work/one', 4, 8_000_000);
  add('old', 'claude-code', 'claude-opus-5', '/work/one', 40, 16_000_000);
});

describe('usage', () => {
  it('totals only what is inside the range', () => {
    const result = usage(filters());
    expect(result.totals.total).toBe(15_000_000);
    expect(result.totals.sessions).toBe(4);
  });

  it('gives up on a cost total the moment one model has no price', () => {
    expect(usage(filters()).totals.cost).toBeNull();
    expect(usage(filters({ tools: ['claude-code'] })).totals.cost).toBe(15);
    expect(usage(filters()).unpriced).toEqual(['a-model-nobody-priced']);
  });

  it('narrows by every filter at once', () => {
    const result = usage(filters({ tools: ['codex'], projects: ['/work/one'] }));
    expect(result.totals.total).toBe(12_000_000);
    expect(result.byModel.map((slice) => slice.key).sort()).toEqual([
      'a-model-nobody-priced',
      'gpt-5.6-sol'
    ]);
  });

  it('compares against the window of the same length just before it', () => {
    const result = usage(filters({ from: now - 3 * DAY, to: now + DAY }));
    expect(result.totals.total).toBe(7_000_000);
    expect(result.previous.total).toBe(8_000_000);
  });

  it('draws the calendar from everything, whatever range is picked', () => {
    const result = usage(filters());
    const inCalendar = result.calendar.reduce((sum, day) => sum + day.total, 0);
    expect(inCalendar).toBe(31_000_000);
  });

  it('keeps the project filter on the calendar', () => {
    const result = usage(filters({ projects: ['/work/two'] }));
    expect(result.calendar).toHaveLength(1);
    expect(result.calendar[0].total).toBe(2_000_000);
  });
});
