import { saveSettings, settings, type Settings } from '#lib/server/settings.js';
import { clearUsageMemo } from '#lib/server/queries.js';
import { refresh } from '#lib/server/refresh.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => Response.json(settings());

export const POST: RequestHandler = async ({ request }) => {
  const patch = (await request.json()) as Partial<Settings>;
  const next = saveSettings(patch);
  clearUsageMemo();
  if (patch.claudeWindows || patch.prices) await refresh();
  return Response.json(next);
};
