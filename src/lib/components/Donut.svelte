<script lang="ts">
  import { tooltip } from '$lib/tooltip';

  let {
    slices,
    centre,
    caption
  }: {
    slices: { id: string; label: string; value: number; colour: string; display: string }[];
    centre: string;
    caption: string;
  } = $props();

  const RADIUS = 52;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const arcs = $derived.by(() => {
    const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
    let offset = 0;
    return slices.map((slice) => {
      const length = (slice.value / total) * CIRCUMFERENCE;
      const arc = { ...slice, length, offset, share: (slice.value / total) * 100 };
      offset += length;
      return arc;
    });
  });
</script>

<div class="donut">
  <svg viewBox="0 0 140 140" role="img" aria-label={caption}>
    <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="var(--surface-3)" stroke-width="18" />
    {#each arcs as arc (arc.id)}
      <circle
        cx="70"
        cy="70"
        r={RADIUS}
        fill="none"
        stroke={arc.colour}
        stroke-width="18"
        stroke-dasharray="{Math.max(0, arc.length - 2)} {CIRCUMFERENCE}"
        stroke-dashoffset={-arc.offset}
        transform="rotate(-90 70 70)"
        use:tooltip={`${arc.label} - ${arc.display} (${arc.share.toFixed(1)}%)`}
      />
    {/each}
    <text class="centre num" x="70" y="66" text-anchor="middle">{centre}</text>
    <text class="sub" x="70" y="84" text-anchor="middle">{caption}</text>
  </svg>
</div>

<style>
  .donut {
    display: flex;
    justify-content: center;

    svg {
      width: 100%;
      max-width: 190px;
      height: auto;
    }

    circle {
      transition: opacity var(--quick);

      &:hover {
        opacity: 0.75;
      }
    }
  }

  .centre {
    fill: var(--text);
    font-size: 22px;
    font-weight: 600;
  }

  .sub {
    fill: var(--text-faint);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
</style>
