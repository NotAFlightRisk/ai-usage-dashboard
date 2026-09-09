export type Level = 'error' | 'warn' | 'info';

export type Problem = {
  id: string;
  level: Level;
  scope: string;
  message: string;
  hint: string;
  at: number;
};

const seen = new Map<string, Problem>();

/** Keyed on id so a fault that repeats every scan stays one row in the panel. */
export function report(problem: Omit<Problem, 'at'>): void {
  seen.set(problem.id, { ...problem, at: Date.now() });
}

export function resolve(id: string): void {
  seen.delete(id);
}

export const problems = () => [...seen.values()].sort((a, b) => b.at - a.at);

export const describe = (error: unknown) =>
  error instanceof Error ? error.message : String(error);
