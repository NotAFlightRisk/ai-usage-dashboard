export type Rate = { input: number; output: number; cacheRead: number; cacheWrite: number };

export type Tokens = {
  input: number;
  output: number;
  cache_read: number;
  cache_write: number;
};

/** Dollars per million. Anthropic bills cache reads at a tenth and 5m writes at 1.25x. */
const anthropic = (input: number, output: number): Rate => ({
  input,
  output,
  cacheRead: input * 0.1,
  cacheWrite: input * 1.25
});

/** OpenAI discounts cached input and charges nothing to put it there. */
const openai = (input: number, output: number): Rate => ({
  input,
  output,
  cacheRead: input * 0.1,
  cacheWrite: 0
});

export const RATES: Record<string, Rate> = {
  'claude-fable-5': anthropic(10, 50),
  'claude-opus-5': anthropic(5, 25),
  'claude-opus-4-8': anthropic(5, 25),
  'claude-opus-4-7': anthropic(5, 25),
  'claude-opus-4-6': anthropic(5, 25),
  'claude-opus-4-5': anthropic(5, 25),
  'claude-opus-4-1': anthropic(15, 75),
  'claude-sonnet-5': anthropic(3, 15),
  'claude-sonnet-4-6': anthropic(3, 15),
  'claude-sonnet-4-5': anthropic(3, 15),
  'claude-sonnet-4': anthropic(3, 15),
  'claude-haiku-4-5': anthropic(1, 5),
  'claude-3-5-haiku': anthropic(0.8, 4),
  'gpt-5.6-sol-pro': openai(2.5, 15),
  'gpt-5.6-sol': openai(2.5, 15),
  'gpt-5.6-terra': openai(2, 12),
  'gpt-5.6-luna': openai(0.2, 1.2),
  'gpt-5': openai(1.25, 10),
  'gpt-5-mini': openai(0.25, 2),
  'gpt-5-nano': openai(0.05, 0.4),
  'gpt-4.1': openai(2, 8),
  'gpt-4o': openai(2.5, 10),
  'gemini-3-pro': openai(2, 12),
  'gemini-2.5-pro': openai(1.25, 10),
  'gemini-2.5-flash': openai(0.3, 2.5)
};

/** Longest matching family, so a dated snapshot prices like the model it is. */
export function rateFor(model: string, overrides: Record<string, Rate> = {}): Rate | null {
  const table = { ...RATES, ...overrides };
  if (table[model]) return table[model];
  const name = model.includes('/') ? model.slice(model.indexOf('/') + 1) : model;
  if (table[name]) return table[name];
  const match = Object.keys(table)
    .filter((key) => name.startsWith(key) && /^[-@:.]/.test(name.slice(key.length)))
    .sort((a, b) => b.length - a.length)[0];
  return match ? table[match] : null;
}

/** Null rather than zero for a model we have no price for, so the UI can own up to it. */
export function costOf(
  model: string,
  tokens: Tokens,
  overrides: Record<string, Rate> = {}
): number | null {
  const rate = rateFor(model, overrides);
  if (!rate) return null;
  return (
    (tokens.input * rate.input +
      tokens.output * rate.output +
      tokens.cache_read * rate.cacheRead +
      tokens.cache_write * rate.cacheWrite) /
    1_000_000
  );
}

export const totalOf = (tokens: Tokens) =>
  tokens.input + tokens.output + tokens.cache_read + tokens.cache_write;
