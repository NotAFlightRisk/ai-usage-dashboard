import { resolveRange } from '../range';
import { settings } from './settings';
import type { Filters } from '../types';

export function filtersFrom(url: URL): Filters {
  const id = url.searchParams.get('range') || settings().range;
  const { from, to, range } = resolveRange(id);
  const list = (name: string) =>
    (url.searchParams.get(name) || '').split(',').filter(Boolean).slice(0, 200);

  return {
    from,
    to,
    range,
    tools: list('tools'),
    models: list('models'),
    projects: list('projects')
  };
}
