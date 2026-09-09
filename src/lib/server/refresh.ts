import { scan } from './scan';
import { refreshClaudeWindows } from './windows';
import { settings } from './settings';
import { describe, report } from './problems';

let timer: NodeJS.Timeout | null = null;

export async function refresh(): Promise<void> {
  await Promise.all([
    scan().catch((error) =>
      report({
        id: 'scan',
        level: 'error',
        scope: 'Scan',
        message: 'The scan stopped early',
        hint: describe(error)
      })
    ),
    refreshClaudeWindows()
  ]);
}

export function boot(): void {
  if (timer) return;
  const every = Math.max(15, settings().scanIntervalSec) * 1000;
  timer = setInterval(() => void refresh(), every);
  timer.unref?.();
  void refresh();
}
