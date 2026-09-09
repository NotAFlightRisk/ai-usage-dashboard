<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import Mark from '$lib/logos/Mark.svelte';
  import { clockLabel, compact, duration, modelName, money, projectName } from '$lib/format';
  import { toolMeta } from '$lib/providers';
  import type { SessionRow } from '$lib/types';

  let {
    rows,
    metric,
    onpick
  }: { rows: SessionRow[]; metric: 'tokens' | 'cost'; onpick?: (project: string) => void } =
    $props();
</script>

{#if rows.length}
  <div class="scroll">
    <table>
      <thead>
        <tr>
          <th scope="col">Session</th>
          <th scope="col">Project</th>
          <th scope="col">Models</th>
          <th scope="col">Ran</th>
          <th scope="col" class="right">{metric === 'cost' ? 'Est. cost' : 'Tokens'}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.id)}
          {@const tool = toolMeta(row.tool)}
          <tr>
            <td>
              <span class="tool">
                <Mark id={row.tool} label={tool.label} colour={tool.colour} size={14} />
                <span class="id mono" use:tooltip={row.id}>{row.id.slice(0, 8)}</span>
              </span>
            </td>
            <td>
              <button
                type="button"
                class="link"
                use:tooltip={row.project || 'unknown'}
                onclick={() => onpick?.(row.project)}>{projectName(row.project)}</button
              >
            </td>
            <td class="models">{row.models.split(', ').map(modelName).join(', ')}</td>
            <td use:tooltip={`${clockLabel(row.started)} for ${duration(row.ended - row.started)}`}>
              {clockLabel(row.ended)}
            </td>
            <td class="right num">
              {metric === 'cost' ? money(row.cost) : compact(row.total)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <p class="empty">No sessions in this range</p>
{/if}

<style>
  .scroll {
    overflow-x: auto;
    max-height: 420px;
    overflow-y: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 0 10px 8px;
    background: var(--surface);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    text-align: left;
    color: var(--text-faint);
    white-space: nowrap;
  }

  td {
    padding: 7px 10px;
    border-top: 1px solid var(--border);
    white-space: nowrap;
  }

  tbody tr:hover td {
    background: var(--surface-2);
  }

  .right {
    text-align: right;
  }

  .tool {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .mono {
    font-family: var(--mono);
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .models {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-muted);
  }

  .link {
    padding: 0;
    background: none;
    border: 0;
    color: var(--text);
    text-decoration: underline;
    text-decoration-color: var(--border-strong);
    text-underline-offset: 3px;

    &:hover {
      color: var(--accent);
      text-decoration-color: currentColor;
    }
  }

  .empty {
    margin: 0;
    padding: 24px 0;
    text-align: center;
    color: var(--text-faint);
  }
</style>
