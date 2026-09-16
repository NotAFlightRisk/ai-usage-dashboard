<script lang="ts">
  import { tooltip } from '$lib/tooltip';

  let {
    options,
    hidden = $bindable(),
    onchange
  }: {
    options: { id: string; label: string }[];
    hidden: string[];
    onchange?: (hidden: string[]) => void;
  } = $props();

  let open = $state(false);
  let wrapper: HTMLDivElement;

  const toggle = (id: string) => {
    hidden = hidden.includes(id) ? hidden.filter((value) => value !== id) : [...hidden, id];
    onchange?.(hidden);
  };

  const away = (event: MouseEvent) => {
    if (open && !wrapper.contains(event.target as Node)) open = false;
  };
</script>

<svelte:window onclick={away} />

<div class="fields" bind:this={wrapper}>
  <button
    type="button"
    class="trigger"
    aria-label="Choose columns"
    aria-expanded={open}
    use:tooltip={'Choose columns'}
    onclick={() => (open = !open)}
  >
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M2.5 4h11M2.5 8h11M2.5 12h11M6 2.5v11M10 2.5v11"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </svg>
  </button>

  {#if open}
    <div class="menu">
      {#each options as option (option.id)}
        <label>
          <input
            type="checkbox"
            checked={!hidden.includes(option.id)}
            onchange={() => toggle(option.id)}
          />
          <span>{option.label}</span>
        </label>
      {/each}
    </div>
  {/if}
</div>

<style>
  .fields {
    position: relative;
  }

  .trigger {
    display: grid;
    place-items: center;
    padding: 5px;
    color: var(--text-muted);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 999px;
    transition:
      border-color var(--quick),
      color var(--quick);

    &:hover,
    &[aria-expanded='true'] {
      color: var(--text);
      border-color: var(--border-strong);
    }
  }

  .menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    width: 200px;
    padding: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-pop);
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
  }

  input {
    accent-color: var(--accent);
  }
</style>
