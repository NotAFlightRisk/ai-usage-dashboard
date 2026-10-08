import { refresh } from '#lib/server/refresh.js';
import { filtersFrom } from '#lib/server/request.js';
import { usage } from '#lib/server/queries.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ url }) => {
  await refresh(true);
  return Response.json(usage(filtersFrom(url)));
};
