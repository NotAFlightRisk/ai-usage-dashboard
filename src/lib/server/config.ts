import { homedir } from 'node:os';
import { join } from 'node:path';

const home = homedir();
const env = (name: string, fallback: string) => (process.env[name] || '').trim() || fallback;

const dataHome = env('XDG_DATA_HOME', join(home, '.local', 'share'));

export const config = {
  dbPath: env('AIUSAGE_DB', join(dataHome, 'ai-usage-dashboard', 'usage.db')),
  claudeDir: env('AIUSAGE_CLAUDE_DIR', join(home, '.claude')),
  codexDir: env('AIUSAGE_CODEX_DIR', join(home, '.codex')),
  openCodeDir: env('AIUSAGE_OPENCODE_DIR', join(dataHome, 'opencode')),
  geminiDir: env('AIUSAGE_GEMINI_DIR', join(home, '.gemini')),
  openRouterKey: env('OPENROUTER_API_KEY', ''),
  scanIntervalMs: Number(env('AIUSAGE_SCAN_INTERVAL', '120')) * 1000
};
