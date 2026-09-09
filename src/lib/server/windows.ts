import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from './config';
import { db } from './db';
import { describe, report, resolve } from './problems';
import { settings } from './settings';

const ENDPOINT = 'https://api.anthropic.com/api/oauth/usage';

const LABELS: Record<string, [string, number]> = {
  five_hour: ['Claude 5-hour', 300],
  seven_day: ['Claude 7-day', 10080],
  seven_day_opus: ['Claude 7-day (Opus)', 10080],
  seven_day_oauth_apps: ['Claude 7-day (apps)', 10080]
};

type Window = { used_percentage?: number; utilization?: number; resets_at?: string | number };

const percent = (window: Window) => window.used_percentage ?? window.utilization;

function resets(window: Window): number | null {
  if (!window.resets_at) return null;
  const at =
    typeof window.resets_at === 'number'
      ? new Date(window.resets_at * 1000)
      : new Date(window.resets_at);
  return Number.isNaN(at.getTime()) ? null : at.getTime();
}

async function token(): Promise<string> {
  const path = join(config.claudeDir, '.credentials.json');
  const raw = JSON.parse(await readFile(path, 'utf8'));
  const oauth = raw.claudeAiOauth ?? raw.oauth ?? raw;
  const access = oauth.accessToken ?? oauth.access_token;
  if (!access) throw new Error(`no OAuth access token in ${path}`);
  return access;
}

/**
 * Subscription windows straight from the account, which is the only place they exist. Reads the
 * local Claude Code credentials to ask, so it is a setting rather than an always-on.
 */
export async function refreshClaudeWindows(): Promise<void> {
  if (!settings().claudeWindows) return;

  try {
    const response = await fetch(ENDPOINT, {
      headers: {
        authorization: `Bearer ${await token()}`,
        'anthropic-beta': 'oauth-2025-04-20',
        accept: 'application/json'
      },
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`the usage endpoint answered ${response.status}`);

    const body = (await response.json()) as Record<string, Window>;
    const insert = db().prepare(
      'insert into windows (id, tool, label, used_percent, window_minutes, resets_at, detail,' +
        ' seen_at) values (?, ?, ?, ?, ?, ?, ?, ?) on conflict(id) do update set' +
        ' used_percent = excluded.used_percent, resets_at = excluded.resets_at,' +
        ' seen_at = excluded.seen_at'
    );
    const seenAt = Date.now();
    let found = 0;

    for (const [key, [label, minutes]] of Object.entries(LABELS)) {
      const window = body[key];
      if (!window || percent(window) === undefined) continue;
      insert.run(
        `claude-${key}`,
        'claude-code',
        label,
        percent(window)!,
        minutes,
        resets(window),
        '',
        seenAt
      );
      found += 1;
    }
    if (!found) throw new Error('the usage endpoint returned no windows we recognise');
    resolve('windows:claude');
  } catch (error) {
    report({
      id: 'windows:claude',
      level: 'info',
      scope: 'Claude',
      message: 'Could not read your 5-hour and 7-day windows',
      hint: `${describe(error)}. Sign in with Claude Code, or turn the check off in settings.`
    });
  }
}
