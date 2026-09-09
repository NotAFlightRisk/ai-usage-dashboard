<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import { compact, dayLabel, money } from '$lib/format';

  type Day = { day: string; total: number; cost: number | null; events: number };

  let { days, metric, oldest }: { days: Day[]; metric: 'tokens' | 'cost'; oldest: number | null } =
    $props();

  const GAP = 3;
  const MIN_WEEKS = 18;
  const MAX_WEEKS = 53;
  const LABELS = 32;

  let width = $state(680);

  const iso = (date: Date) => date.toLocaleDateString('en-CA');

  const value = (day: Day | undefined) =>
    !day ? 0 : metric === 'cost' ? (day.cost ?? 0) : day.total;

  const byDay = $derived(new Map(days.map((day) => [day.day, day])));

  const start = $derived(oldest ? iso(new Date(oldest)) : (days[0]?.day ?? ''));

  /** Shows at least a quarter, so a fresh install still reads as a calendar. */
  const grid = $derived.by(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const first = new Date(days.length ? `${days[0].day}T00:00:00` : today);
    const floor = new Date(today);
    floor.setDate(floor.getDate() - (MAX_WEEKS * 7 - 1));
    const shown = new Date(today);
    shown.setDate(shown.getDate() - (MIN_WEEKS * 7 - 1));

    const from = new Date(Math.max(floor.getTime(), Math.min(first.getTime(), shown.getTime())));
    from.setDate(from.getDate() - ((from.getDay() + 6) % 7));

    const cells: { day: string; date: Date; week: number; weekday: number }[] = [];
    const cursor = new Date(from);
    let week = 0;
    while (cursor <= today) {
      const weekday = (cursor.getDay() + 6) % 7;
      cells.push({ day: iso(cursor), date: new Date(cursor), week, weekday });
      if (weekday === 6) week += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    return { cells, weeks: week + 1 };
  });

  const cell = $derived(Math.max(9, Math.min(30, Math.floor((width - LABELS) / grid.weeks) - GAP)));
  const step = $derived(cell + GAP);

  /** Quantile buckets, or one loud day flattens every other square to nothing. */
  const cuts = $derived.by(() => {
    const values = days
      .map((day) => value(day))
      .filter((amount) => amount > 0)
      .sort((a, b) => a - b);
    if (!values.length) return [];
    return [0.2, 0.4, 0.6, 0.8].map((at) => values[Math.floor(values.length * at)]);
  });

  const level = (amount: number) =>
    amount <= 0 ? 0 : cuts.filter((cut) => amount >= cut).length + 1;

  const months = $derived.by(() => {
    const seen: { label: string; week: number }[] = [];
    for (const entry of grid.cells) {
      if (entry.weekday !== 0) continue;
      const label = entry.date.toLocaleDateString('en-GB', { month: 'short' });
      if (!seen.length || (entry.date.getDate() <= 7 && seen[seen.length - 1].label !== label)) {
        seen.push({ label, week: entry.week });
      }
    }
    return seen;
  });

  const dayCaption = (day: string) => {
    if (start && day < start) return `${dayLabel(day)} - before your records start`;
    const amount = value(byDay.get(day));
    const shown = metric === 'cost' ? money(amount) : `${compact(amount)} tokens`;
    return `${dayLabel(day)} - ${amount ? shown : 'nothing'}`;
  };

  const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  const busy = $derived(days.filter((day) => value(day) > 0).length);
  const caption = $derived(
    start ? `Since ${dayLabel(start)}, ${busy} ${busy === 1 ? 'day' : 'days'} with usage` : ''
  );
</script>

<div class="calendar" bind:clientWidth={width}>
  <svg
    width={grid.weeks * step + LABELS}
    height={7 * step + 18}
    role="img"
    aria-label="Daily usage calendar"
  >
    {#each months as month (month.week + month.label)}
      <text class="axis" x={LABELS + month.week * step} y="10">{month.label}</text>
    {/each}
    {#each WEEKDAYS as name, row (row)}
      {#if name}
        <text class="axis" x="0" y={18 + row * step + cell / 2 + 3}>{name}</text>
      {/if}
    {/each}
    {#each grid.cells as entry (entry.day)}
      {@const blank = !!start && entry.day < start}
      <rect
        class="cell"
        class:blank
        x={LABELS + entry.week * step}
        y={18 + entry.weekday * step}
        width={cell}
        height={cell}
        rx={Math.max(2, cell / 4)}
        fill="var(--ramp-{blank ? 0 : level(value(byDay.get(entry.day)))})"
        role="img"
        aria-label={dayCaption(entry.day)}
        use:tooltip={dayCaption(entry.day)}
      />
    {/each}
  </svg>

  <div class="legend">
    <span class="span">{caption}</span>
    <span>No records</span>
    <i class="blank"></i>
    <span class="spread">Quieter</span>
    {#each [0, 1, 2, 3, 4, 5] as tone (tone)}
      <i style="background: var(--ramp-{tone})"></i>
    {/each}
    <span>Busier</span>
  </div>
</div>

<style>
  .calendar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  svg {
    align-self: center;
    max-width: 100%;
  }

  .axis {
    fill: var(--text-faint);
    font-size: 10px;
  }

  .cell {
    transition: opacity var(--quick);

    &:hover {
      opacity: 0.7;
    }

    &.blank {
      opacity: 0.4;
    }
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--text-faint);

    i {
      width: 11px;
      height: 11px;
      border-radius: 3px;

      &.blank {
        background: var(--ramp-0);
        opacity: 0.4;
      }
    }

    .spread {
      margin-left: 14px;
    }

    .span {
      margin-right: auto;
    }
  }
</style>
