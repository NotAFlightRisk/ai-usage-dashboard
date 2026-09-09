<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import { relative } from '$lib/format';
  import type { WindowRow } from '$lib/types';

  let { window: meter }: { window: WindowRow } = $props();

  const stale = $derived(!!meter.resets_at && meter.resets_at < Date.now());
  const tone = $derived(
    stale
      ? 'text-faint'
      : meter.used_percent >= 90
        ? 'bad'
        : meter.used_percent >= 70
          ? 'warn'
          : 'good'
  );
  const hint = $derived(
    [
      meter.detail,
      meter.resets_at ? `resets ${relative(meter.resets_at)}` : '',
      `seen ${relative(meter.seen_at)}`
    ]
      .filter(Boolean)
      .join(' - ')
  );
</script>

<div class="meter" class:stale use:tooltip={hint}>
  <div class="top">
    <span class="name">{meter.label}</span>
    <span class="num pct" style="color: var(--{tone})">{Math.round(meter.used_percent)}%</span>
  </div>
  <div
    class="track"
    role="meter"
    aria-valuenow={Math.round(meter.used_percent)}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label={meter.label}
  >
    <span style="width: {Math.min(100, meter.used_percent)}%; background: var(--{tone})"></span>
  </div>
  <span class="reset">
    {#if stale}
      window has turned over, last read {relative(meter.seen_at)}
    {:else if meter.resets_at}
      resets {relative(meter.resets_at)}
    {/if}
  </span>
</div>

<style>
  .meter {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &.stale {
      opacity: 0.65;
    }
  }

  .top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .name {
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .pct {
    font-size: 1rem;
    font-weight: 600;
  }

  .track {
    height: 7px;
    background: var(--surface-3);
    border-radius: 999px;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      border-radius: 999px;
      transition: width 400ms var(--ease);
    }
  }

  .reset {
    font-size: 0.75rem;
    color: var(--text-faint);
  }
</style>
