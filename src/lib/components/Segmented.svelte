<script lang="ts" generics="T extends string">
  import { tooltip } from '$lib/tooltip';

  let {
    options,
    value = $bindable(),
    label,
    size = 'md'
  }: {
    options: { id: T; label: string; hint?: string }[];
    value: T;
    label: string;
    size?: 'sm' | 'md';
  } = $props();
</script>

<div class="segmented" class:sm={size === 'sm'} role="group" aria-label={label}>
  {#each options as option (option.id)}
    <button
      type="button"
      class:on={value === option.id}
      aria-pressed={value === option.id}
      use:tooltip={option.hint}
      onclick={() => (value = option.id)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segmented {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 999px;

    button {
      padding: 5px 12px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-muted);
      background: none;
      border: 0;
      border-radius: 999px;
      transition:
        color var(--quick),
        background var(--quick);

      &:hover:not(.on) {
        color: var(--text);
        background: var(--surface-3);
      }

      &.on {
        color: var(--text);
        background: var(--surface);
        box-shadow: var(--shadow);
      }
    }

    &.sm button {
      padding: 3px 9px;
      font-size: 0.75rem;
    }
  }
</style>
