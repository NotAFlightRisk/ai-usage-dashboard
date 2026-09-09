<script lang="ts">
  let { size = 28 }: { size?: number } = $props();

  // heat rising to the top right, the same read as the calendar below it
  const cells = [0, 1, 2, 3].flatMap((row) =>
    [0, 1, 2, 3].map((column) => ({
      row,
      column,
      heat: (column + (3 - row)) / 6
    }))
  );
</script>

<svg
  class="logo"
  viewBox="0 0 32 32"
  width={size}
  height={size}
  role="img"
  aria-label="AI usage dashboard"
>
  <rect width="32" height="32" rx="8" fill="var(--accent)" />
  {#each cells as cell (`${cell.row}-${cell.column}`)}
    <rect
      x={5 + cell.column * 6}
      y={5 + cell.row * 6}
      width="4"
      height="4"
      rx="1.2"
      fill="var(--accent-text)"
      opacity={(0.22 + cell.heat * 0.78).toFixed(2)}
    />
  {/each}
</svg>

<style>
  .logo {
    flex: none;
    display: block;
  }
</style>
