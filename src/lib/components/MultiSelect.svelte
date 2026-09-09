<script lang="ts">
  let {
    label,
    options,
    selected = $bindable(),
    format = (value: string) => value
  }: {
    label: string;
    options: string[];
    selected: string[];
    format?: (value: string) => string;
  } = $props();

  let open = $state(false);
  let query = $state('');
  let wrapper: HTMLDivElement;

  const shown = $derived(
    options.filter((option) => format(option).toLowerCase().includes(query.toLowerCase()))
  );

  const toggle = (option: string) => {
    selected = selected.includes(option)
      ? selected.filter((value) => value !== option)
      : [...selected, option];
  };

  const away = (event: MouseEvent) => {
    if (open && !wrapper.contains(event.target as Node)) open = false;
  };
</script>

<svelte:window onclick={away} />

<div class="select" bind:this={wrapper}>
  <button
    type="button"
    class="trigger"
    class:on={selected.length > 0}
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    {label}
    {#if selected.length}<b class="num">{selected.length}</b>{/if}
    <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
      <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
    </svg>
  </button>

  {#if open}
    <div class="menu">
      <input
        class="search"
        type="search"
        placeholder="Filter {label.toLowerCase()}"
        bind:value={query}
      />
      <div class="list">
        {#each shown as option (option)}
          <label>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onchange={() => toggle(option)}
            />
            <span>{format(option)}</span>
          </label>
        {:else}
          <p class="none">Nothing matches</p>
        {/each}
      </div>
      {#if selected.length}
        <button type="button" class="clear" onclick={() => (selected = [])}>Clear</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .select {
    position: relative;
  }

  .trigger {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 11px;
    font-size: 0.8125rem;
    color: var(--text-muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    transition:
      border-color var(--quick),
      color var(--quick);

    &:hover {
      color: var(--text);
      border-color: var(--border-strong);
    }

    &.on {
      color: var(--text);
      border-color: var(--accent);
      background: var(--accent-soft);
    }

    b {
      padding: 0 6px;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--accent-text);
      background: var(--accent);
      border-radius: 999px;
    }
  }

  .menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 40;
    width: 260px;
    padding: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-pop);
  }

  .search {
    width: 100%;
    padding: 6px 9px;
    margin-bottom: 6px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.8125rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    max-height: 260px;
    overflow-y: auto;
  }

  label {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    font-size: 0.8125rem;
    cursor: pointer;

    &:hover {
      background: var(--surface-2);
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  input[type='checkbox'] {
    flex: none;
    accent-color: var(--accent);
  }

  .none {
    margin: 0;
    padding: 12px;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--text-faint);
  }

  .clear {
    width: 100%;
    margin-top: 6px;
    padding: 6px;
    font-size: 0.8125rem;
    color: var(--text-muted);
    background: var(--surface-2);
    border: 0;
    border-radius: var(--radius-sm);

    &:hover {
      color: var(--text);
      background: var(--surface-3);
    }
  }
</style>
