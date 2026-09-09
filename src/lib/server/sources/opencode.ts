import { basename, join } from 'node:path';
import { config } from '../config';
import { num, type Event, type Parsed, type Source } from './types';

type Message = {
  id?: string;
  role?: string;
  sessionID?: string;
  modelID?: string;
  providerID?: string;
  cost?: number;
  time?: { created?: number };
  tokens?: { input?: number; output?: number; reasoning?: number; cache?: Record<string, number> };
  path?: { cwd?: string; root?: string };
};

/** One JSON file per message, so a file that doesn't hold usage simply yields nothing. */
export const opencode: Source = {
  id: 'opencode',
  label: 'OpenCode',
  root: join(config.openCodeDir, 'storage', 'message'),
  ext: '.json',

  parse(path, text): Parsed {
    let message: Message;
    try {
      message = JSON.parse(text);
    } catch {
      return { events: [] };
    }

    const tokens = message.tokens;
    const created = message.time?.created;
    if (message.role !== 'assistant' || !tokens || !created) return { events: [] };

    const model = message.providerID ? `${message.providerID}/${message.modelID}` : message.modelID;
    if (!model) return { events: [] };

    const event: Event = {
      id: `opencode:${message.id || basename(path, '.json')}`,
      model,
      session: String(message.sessionID || ''),
      project: String(message.path?.cwd || message.path?.root || ''),
      ts: created < 1e12 ? created * 1000 : created,
      input: num(tokens.input),
      output: num(tokens.output),
      cache_read: num(tokens.cache?.read),
      cache_write: num(tokens.cache?.write),
      reasoning: num(tokens.reasoning)
    };
    return { events: [event] };
  }
};
