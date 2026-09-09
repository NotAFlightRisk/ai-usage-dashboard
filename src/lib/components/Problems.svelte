<script lang="ts">
  import { relative } from '$lib/format';
  import type { Usage } from '$lib/types';

  let { problems }: { problems: Usage['problems'] } = $props();

  let dismissed = $state<string[]>([]);
  let open = $state(false);

  const shown = $derived(problems.filter((problem) => !dismissed.includes(problem.id)));
  const worst = $derived(
    shown.some((problem) => problem.level === 'error')
      ? 'error'
      : shown.some((problem) => problem.level === 'warn')
        ? 'warn'
        : 'info'
  );
</script>

{#if shown.length}
  <aside class="problems {worst}" aria-live="polite">
    <button type="button" class="head" aria-expanded={open} onclick={() => (open = !open)}>
      <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
        <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path d="M8 4.6v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
      </svg>
      <span>{shown.length === 1 ? shown[0].message : `${shown.length} things need a look`}</span>
      <em>{open ? 'Hide' : 'Details'}</em>
    </button>

    {#if open}
      <ul>
        {#each shown as problem (problem.id)}
          <li>
            <div>
              <b>{problem.scope}</b>
              <span>{problem.message}</span>
              {#if problem.hint}<span class="hint">{problem.hint}</span>{/if}
              <time>{relative(problem.at)}</time>
            </div>
            <button
              type="button"
              class="close"
              aria-label="Dismiss"
              onclick={() => (dismissed = [...dismissed, problem.id])}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </aside>
{/if}

<style>
  .problems {
    position: fixed;
    inset: auto 16px 16px auto;
    z-index: 60;
    width: min(440px, calc(100vw - 32px));
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-pop);
    overflow: hidden;

    &.error {
      color: var(--bad);
    }

    &.warn {
      color: var(--warn);
    }

    &.info {
      color: var(--text-muted);
    }
  }

  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 11px 14px;
    background: none;
    border: 0;
    text-align: left;

    span {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.875rem;
      color: var(--text);
    }

    em {
      font-style: normal;
      font-size: 0.75rem;
      color: var(--text-faint);
    }

    &:hover em {
      color: var(--text);
    }
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0 8px 8px;
    max-height: 320px;
    overflow-y: auto;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: var(--surface-2);
    border-radius: var(--radius-sm);

    div {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
      font-size: 0.8125rem;
      color: var(--text);
    }

    b {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: currentColor;
    }

    .hint {
      color: var(--text-muted);
    }

    time {
      font-size: 0.6875rem;
      color: var(--text-faint);
    }
  }

  .close {
    flex: none;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    color: var(--text-faint);
    background: none;
    border: 0;
    border-radius: 6px;

    &:hover {
      color: var(--text);
      background: var(--surface-3);
    }
  }
</style>
