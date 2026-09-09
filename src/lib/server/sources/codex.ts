import { basename, join } from 'node:path';
import { config } from '../config';
import { jsonLines, num, type Event, type Parsed, type Source, type Window } from './types';

type Usage = Record<string, number>;
type Limit = { used_percent?: number; window_minutes?: number; resets_at?: number };

const label = (minutes: number | undefined) => {
  if (minutes === 300) return 'Codex 5-hour';
  if (minutes === 10080) return 'Codex weekly';
  return minutes ? `Codex ${minutes}-minute` : 'Codex';
};

function window(id: string, limit: Limit | undefined, plan: string, seenAt: number) {
  if (!limit || typeof limit.used_percent !== 'number') return null;
  return {
    id: `codex-${id}`,
    label: label(limit.window_minutes),
    used_percent: limit.used_percent,
    window_minutes: limit.window_minutes ?? null,
    resets_at: limit.resets_at ? limit.resets_at * 1000 : null,
    detail: plan ? `${plan} plan` : '',
    seen_at: seenAt
  };
}

/**
 * Keyed on the rollout plus its running cumulative total. The total dedupes the identical
 * `token_count` Codex writes again at the end of a rollout; the rollout keeps a resumed session
 * that restarts its counter from colliding with the original.
 */
export const codex: Source = {
  id: 'codex',
  label: 'Codex',
  root: join(config.codexDir, 'sessions'),
  ext: '.jsonl',

  parse(path, text): Parsed {
    const events: Event[] = [];
    let windows: Window[] = [];
    const rollout = basename(path, '.jsonl');
    let session = '';
    let project = '';
    let model = 'unknown';

    for (const line of jsonLines(text)) {
      const payload = (line.payload ?? {}) as Record<string, unknown>;
      const kind = line.type === 'event_msg' ? payload.type : line.type;

      if (kind === 'session_meta') {
        session = String(payload.session_id || payload.id || '');
        project = String(payload.cwd || '');
        continue;
      }
      if (kind === 'turn_context' && payload.model) {
        model = String(payload.model);
        continue;
      }
      if (kind !== 'token_count') continue;

      const info = payload.info as Record<string, Usage> | undefined;
      const turn = info?.last_token_usage;
      const running = info?.total_token_usage;
      if (!turn || !running) continue;

      const ts = Date.parse(String(line.timestamp));
      if (Number.isNaN(ts)) continue;

      events.push({
        id: `codex:${rollout}:${num(running.total_tokens)}`,
        model,
        session: session || rollout,
        project,
        ts,
        input: Math.max(0, num(turn.input_tokens) - num(turn.cached_input_tokens)),
        output: num(turn.output_tokens),
        cache_read: num(turn.cached_input_tokens),
        cache_write: num(turn.cache_write_input_tokens),
        reasoning: num(turn.reasoning_output_tokens)
      });

      const limits = payload.rate_limits as Record<string, Limit | string> | undefined;
      if (!limits) continue;
      const plan = typeof limits.plan_type === 'string' ? limits.plan_type : '';
      windows = [
        window('primary', limits.primary as Limit, plan, ts),
        window('secondary', limits.secondary as Limit, plan, ts)
      ].filter((entry): entry is Window => entry !== null);
    }

    return { events, windows };
  }
};
