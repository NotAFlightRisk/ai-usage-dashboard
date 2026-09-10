import { describe, expect, it } from 'vitest';
import { modelName } from '../src/lib/format';

describe('model names', () => {
  it('drops the release stamp so one model is not listed twice', () => {
    expect(modelName('claude-haiku-4-5-20251001')).toBe('claude-haiku-4-5');
  });

  it('drops the vendor prefix OpenRouter puts on the front', () => {
    expect(modelName('anthropic/claude-sonnet-5')).toBe('claude-sonnet-5');
  });

  it('leaves a name that only looks like it ends in a date', () => {
    expect(modelName('gpt-5')).toBe('gpt-5');
    expect(modelName('claude-opus-5')).toBe('claude-opus-5');
  });
});
