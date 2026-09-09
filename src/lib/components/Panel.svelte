<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tooltip } from '$lib/tooltip';

  let {
    title,
    hint,
    span = 12,
    actions,
    children
  }: {
    title: string;
    hint?: string;
    span?: number;
    actions?: Snippet;
    children: Snippet;
  } = $props();
</script>

<section class="panel" style="--span: {span}">
  <header>
    <h2 use:tooltip={hint}>{title}</h2>
    {#if actions}
      <div class="actions">{@render actions()}</div>
    {/if}
  </header>
  <div class="body">{@render children()}</div>
</section>

<style>
  .panel {
    grid-column: span var(--span);
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px var(--pad);
      border-bottom: 1px solid var(--border);

      h2 {
        font-size: 0.8125rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      min-width: 0;
      padding: var(--pad);
    }
  }

  @media (max-width: 900px) {
    .panel {
      grid-column: span 12;
    }
  }
</style>
