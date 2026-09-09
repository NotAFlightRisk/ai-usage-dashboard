<script lang="ts">
  import { tooltip } from '$lib/tooltip';

  let {
    parts
  }: {
    parts: {
      id: string;
      label: string;
      value: number;
      display: string;
      colour: string;
      hint: string;
    }[];
  } = $props();

  const total = $derived(parts.reduce((sum, part) => sum + part.value, 0) || 1);
</script>

<div class="split">
  <div class="bar">
    {#each parts as part (part.id)}
      {#if part.value > 0}
        <span
          style="flex: {part.value}; background: {part.colour}"
          use:tooltip={`${part.label} - ${part.display} (${((part.value / total) * 100).toFixed(1)}%)`}
        ></span>
      {/if}
    {/each}
  </div>
  <ul>
    {#each parts as part (part.id)}
      <li use:tooltip={part.hint}>
        <i style="background: {part.colour}"></i>
        <span class="name">{part.label}</span>
        <span class="value num">{part.display}</span>
        <span class="share num">{((part.value / total) * 100).toFixed(1)}%</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .split {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .bar {
    display: flex;
    gap: 2px;
    height: 12px;

    span {
      min-width: 4px;
      border-radius: 3px;
      transition: opacity var(--quick);

      &:hover {
        opacity: 0.75;
      }
    }
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 10px 1fr auto auto;
    align-items: center;
    gap: 10px;
    padding: 3px 0;
    font-size: 0.875rem;

    i {
      width: 9px;
      height: 9px;
      border-radius: 3px;
    }
  }

  .name {
    color: var(--text-muted);
  }

  .value {
    font-weight: 550;
  }

  .share {
    min-width: 48px;
    text-align: right;
    color: var(--text-faint);
  }
</style>
