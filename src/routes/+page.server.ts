import { filtersFrom } from '#lib/server/request.js';
import { usage } from '#lib/server/queries.js';
import { settings } from '#lib/server/settings.js';
import { config } from '#lib/server/config.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({
  usage: usage(filtersFrom(url)),
  settings: settings(),
  paths: { db: config.dbPath }
});
