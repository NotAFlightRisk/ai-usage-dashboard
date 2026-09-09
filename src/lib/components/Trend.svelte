<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import { compact, dayLabel, money } from '$lib/format';
  import type { DayPoint } from '$lib/types';

  let {
    series,
    keys,
    metric
  }: {
    series: DayPoint[];
    keys: { id: string; label: string; colour: string }[];
    metric: 'tokens' | 'cost';
  } = $props();

  const amount = (point: DayPoint) => (metric === 'cost' ? (point.cost ?? 0) : point.total);
  const format = (value: number) => (metric === 'cost' ? money(value) : compact(value));

  const columns = $derived.by(() => {
    const days = new Map<string, { day: string; total: number; parts: Map<string, number> }>();
    for (const point of series) {
      const entry = days.get(point.day) ?? { day: point.day, total: 0, parts: new Map() };
      entry.total += amount(point);
      entry.parts.set(point.key, (entry.parts.get(point.key) ?? 0) + amount(point));
      days.set(point.day, entry);
    }
    return [...days.values()].sort((a, b) => a.day.localeCompare(b.day));
  });

  const peak = $derived(Math.max(1, ...columns.map((column) => column.total)));

  const caption = (column: { day: string; total: number; parts: Map<string, number> }) => {
    const parts = keys
      .filter((key) => column.parts.get(key.id))
      .map((key) => `${key.label} ${format(column.parts.get(key.id) ?? 0)}`)
      .join(', ');
    return `${dayLabel(column.day)} - ${format(column.total)}${parts ? ` (${parts})` : ''}`;
  };

  const ticks = $derived([1, 0.5, 0].map((at) => ({ at, label: format(peak * at) })));
</script>

<div class="trend">
  <div class="plot">
    {#each ticks as tick (tick.at)}
      <div class="tick" style="bottom: {tick.at * 100}%"><span>{tick.label}</span></div>
    {/each}
    <div class="bars">
      {#each columns as column (column.day)}
        <div class="column" use:tooltip={caption(column)}>
          <div class="stack" style="height: {(column.total / peak) * 100}%">
            {#each keys as key (key.id)}
              {@const part = column.parts.get(key.id) ?? 0}
              {#if part > 0}
                <span style="flex: {part}; background: {key.colour}" aria-hidden="true"></span>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
  <div class="axis">
    <span>{columns.length ? dayLabel(columns[0].day) : ''}</span>
    <span>{columns.length ? dayLabel(columns[columns.length - 1].day) : ''}</span>
  </div>
</div>

<style>
  .trend {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .plot {
    position: relative;
    height: 200px;
    padding-left: 44px;
  }

  .tick {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed var(--border);

    span {
      position: absolute;
      right: calc(100% + 8px);
      transform: translateY(-50%);
      font-size: 0.6875rem;
      color: var(--text-faint);
      font-variant-numeric: tabular-nums;
    }
  }

  .bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 100%;
  }

  .column {
    flex: 1;
    min-width: 3px;
    height: 100%;
    display: flex;
    align-items: flex-end;
    border-radius: 3px;
    transition: background var(--quick);

    &:hover {
      background: var(--surface-2);
    }
  }

  .stack {
    display: flex;
    flex-direction: column-reverse;
    width: 100%;
    min-height: 2px;
    overflow: hidden;
    border-radius: 3px;

    span {
      display: block;
      min-height: 1px;
    }
  }

  .axis {
    display: flex;
    justify-content: space-between;
    padding-left: 44px;
    font-size: 0.6875rem;
    color: var(--text-faint);
  }
</style>
