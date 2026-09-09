import { boot } from '$lib/server/refresh';
import { settings } from '$lib/server/settings';
import type { Handle } from '@sveltejs/kit';

boot();

/** Stamped on <html> so a dark install doesn't flash white before hydration. */
export const handle: Handle = ({ event, resolve }) =>
  resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%aiusage.theme%', settings().theme === 'auto' ? '' : settings().theme)
  });
