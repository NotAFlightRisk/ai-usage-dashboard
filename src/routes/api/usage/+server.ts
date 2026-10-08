import { filtersFrom } from '#lib/server/request.js';
import { usage } from '#lib/server/queries.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => Response.json(usage(filtersFrom(url)));
