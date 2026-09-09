import { json } from '@sveltejs/kit';
import { refresh } from '$lib/server/refresh';
import { filtersFrom } from '$lib/server/request';
import { usage } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url }) => {
  await refresh();
  return json(usage(filtersFrom(url)));
};
