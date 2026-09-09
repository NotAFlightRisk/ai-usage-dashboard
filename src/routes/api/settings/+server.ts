import { json } from '@sveltejs/kit';
import { saveSettings, settings, type Settings } from '$lib/server/settings';
import { clearUsageMemo } from '$lib/server/queries';
import { refresh } from '$lib/server/refresh';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => json(settings());

export const POST: RequestHandler = async ({ request }) => {
  const patch = (await request.json()) as Partial<Settings>;
  const next = saveSettings(patch);
  clearUsageMemo();
  if (patch.claudeWindows || patch.prices) await refresh();
  return json(next);
};
