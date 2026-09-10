<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import { compact } from '$lib/format';

  let { points }: { points: { day: number; hour: number; total: number }[] } = $props();

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const grid = $derived.by(() => {
    const cells = new Map<string, number>();
    for (const point of points) {
      const row = (point.day + 6) % 7;
      cells.set(`${row}-${point.hour}`, (cells.get(`${row}-${point.hour}`) ?? 0) + point.total);
    }
    return cells;
  });

  const peak = $derived(Math.max(1, ...grid.values()));

  /** Punch card: area scales with the total, so the radius goes as the square root. */
  const dot = (value: number) => (value ? 0.32 + 0.68 * Math.sqrt(value / peak) : 0);
</script>

<div class="clock">
  <div class="rows">
    {#each DAYS as day, row (day)}
      <span class="day">{day}</span>
      <div class="hours">
        {#each Array(24) as _, hour (hour)}
          {@const value = grid.get(`${row}-${hour}`) ?? 0}
          <i
            style="--dot: {dot(value)}"
            use:tooltip={`${day} ${String(hour).padStart(2, '0')}:00 - ${value ? `${compact(value)} tokens` : 'nothing'}`}
          ></i>
        {/each}
      </div>
    {/each}
  </div>
  <div class="scale">
    {#each [0, 6, 12, 18] as hour (hour)}
      <span>{String(hour).padStart(2, '0')}</span>
    {/each}
    <span>23</span>
  </div>
</div>

<style>
  .clock {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rows {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 3px 8px;
  }

  .day {
    font-size: 0.6875rem;
    color: var(--text-faint);
  }

  .hours {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    gap: 3px;

    i {
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--surface-2);

      &::after {
        content: '';
        width: calc(var(--dot) * 100%);
        aspect-ratio: 1;
        border-radius: 50%;
        background: var(--accent);
        transition: transform var(--quick);
      }

      &:hover::after {
        transform: scale(1.25);
      }
    }
  }

  .scale {
    display: flex;
    justify-content: space-between;
    padding-left: 34px;
    font-size: 0.6875rem;
    color: var(--text-faint);
  }
</style>
