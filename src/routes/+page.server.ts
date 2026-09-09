import { filtersFrom } from '$lib/server/request';
import { usage } from '$lib/server/queries';
import { settings } from '$lib/server/settings';
import { config } from '$lib/server/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({
  usage: usage(filtersFrom(url)),
  settings: settings(),
  paths: { db: config.dbPath }
});
