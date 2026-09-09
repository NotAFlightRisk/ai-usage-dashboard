<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import Mark from '$lib/logos/Mark.svelte';

  type Row = {
    id: string;
    label: string;
    detail: string;
    value: number;
    display: string;
    colour: string;
    mark?: string;
    hint?: string;
  };

  let {
    rows,
    active = [],
    onpick,
    empty = 'Nothing in this range'
  }: {
    rows: Row[];
    active?: string[];
    onpick?: (id: string) => void;
    empty?: string;
  } = $props();

  const peak = $derived(Math.max(1, ...rows.map((row) => row.value)));
</script>

{#if rows.length}
  <ul class="bars">
    {#each rows as row (row.id)}
      <li>
        <svelte:element
          this={onpick ? 'button' : 'div'}
          class="row"
          class:on={active.includes(row.id)}
          role={onpick ? 'button' : undefined}
          tabindex={onpick ? 0 : undefined}
          use:tooltip={row.hint}
          onclick={() => onpick?.(row.id)}
        >
          <span class="fill" style="width: {(row.value / peak) * 100}%; background: {row.colour}"
          ></span>
          <span class="label">
            {#if row.mark}
              <Mark id={row.mark} label={row.label} colour={row.colour} size={15} />
            {:else}
              <i class="dot" style="background: {row.colour}"></i>
            {/if}
            <b>{row.label}</b>
            {#if row.detail}<em>{row.detail}</em>{/if}
          </span>
          <span class="value num">{row.display}</span>
        </svelte:element>
      </li>
    {/each}
  </ul>
{:else}
  <p class="empty">{empty}</p>
{/if}

<style>
  .bars {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 7px 10px;
    background: none;
    border: 0;
    border-radius: var(--radius-sm);
    text-align: left;
    isolation: isolate;
    transition: background var(--quick);

    &:hover {
      background: var(--surface-2);
    }

    &.on {
      background: var(--accent-soft);
      box-shadow: inset 0 0 0 1px var(--accent);
    }
  }

  .fill {
    position: absolute;
    inset: 2px auto 2px 2px;
    z-index: -1;
    border-radius: 6px;
    opacity: 0.16;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;

    b {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    em {
      font-style: normal;
      font-size: 0.75rem;
      color: var(--text-faint);
      white-space: nowrap;
    }
  }

  .dot {
    flex: none;
    width: 9px;
    height: 9px;
    border-radius: 3px;
  }

  .value {
    font-weight: 550;
    font-size: 0.875rem;
  }

  .empty {
    margin: 0;
    padding: 24px 0;
    text-align: center;
    color: var(--text-faint);
  }
</style>
