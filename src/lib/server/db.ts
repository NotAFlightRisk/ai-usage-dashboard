import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config';

/** Bump to throw away scanned rows and read every source file again. */
const SCHEMA = 1;

const TABLES = `
create table if not exists events (
  id text primary key,
  tool text not null,
  model text not null,
  session text not null,
  project text not null,
  ts integer not null,
  input integer not null default 0,
  output integer not null default 0,
  cache_read integer not null default 0,
  cache_write integer not null default 0,
  reasoning integer not null default 0
);
create index if not exists events_ts on events (ts);
create table if not exists files (
  path text primary key,
  tool text not null,
  size integer not null,
  mtime integer not null,
  events integer not null default 0,
  scanned_at integer not null
);
create table if not exists windows (
  id text primary key,
  tool text not null,
  label text not null,
  used_percent real not null,
  window_minutes integer,
  resets_at integer,
  detail text not null default '',
  seen_at integer not null
);
create table if not exists meta (key text primary key, value text not null);
`;

let handle: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (handle) return handle;

  mkdirSync(dirname(config.dbPath), { recursive: true });
  handle = new DatabaseSync(config.dbPath);
  handle.exec('pragma journal_mode = wal');
  handle.exec('pragma synchronous = normal');
  handle.exec(TABLES);

  if (readMeta('schema') !== String(SCHEMA)) {
    handle.exec('drop table if exists events; drop table if exists files');
    handle.exec(TABLES);
    writeMeta('schema', String(SCHEMA));
  }
  return handle;
}

export function readMeta(key: string): string | null {
  const row = db().prepare('select value from meta where key = ?').get(key) as
    { value: string } | undefined;
  return row?.value ?? null;
}

export function writeMeta(key: string, value: string): void {
  db()
    .prepare(
      'insert into meta (key, value) values (?, ?) on conflict(key) do update set value = excluded.value'
    )
    .run(key, value);
}
