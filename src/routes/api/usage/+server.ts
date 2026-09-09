import { json } from '@sveltejs/kit';
import { filtersFrom } from '$lib/server/request';
import { usage } from '$lib/server/queries';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => json(usage(filtersFrom(url)));
