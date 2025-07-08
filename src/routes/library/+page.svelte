<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Get filter from URL search params using Svelte 5 $derived rune
  let currentFilter = $derived(page.url.searchParams.get('type') || 'all');

  // Filter content based on current filter
  let filteredContent = $derived(
    currentFilter === 'all' ? data.items : data.items.filter((item) => item.type === currentFilter)
  );

  // Get unique content types for filter buttons
  let contentTypes = $derived(Array.from(new Set(data.items.map((item) => item.type))));

  function setFilter(type: string) {
    const url = new URL(page.url);
    if (type === 'all') {
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('type', type);
    }
    goto(url, { keepFocus: true });
  }

  function clearFilter() {
    setFilter('all');
  }
</script>

<svelte:head>
  <title>Library</title>
</svelte:head>

<div>
  <h1>Library</h1>

  <p>
    <strong>Last updated:</strong>
    {new Date(data.buildTime).toLocaleString()}
    (statically generated)
  </p>

  <!-- Filter Controls -->
  <div>
    <button onclick={() => setFilter('all')}>
      All ({data.items.length})
    </button>

    {#each contentTypes as type}
      {@const count = data.items.filter((item) => item.type === type).length}
      <button onclick={() => setFilter(type)}>
        {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
      </button>
    {/each}

    {#if currentFilter !== 'all'}
      <button onclick={clearFilter}> Clear Filter </button>
    {/if}
  </div>

  <!-- Content List -->
  {#if filteredContent && filteredContent.length > 0}
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Title</th>
          <th>Published By</th>
          <th>Published</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredContent as item}
          <tr>
            <td>{item.type}</td>
            <td>
              {#if item.thumbnail}
                {#if typeof item.thumbnail === 'string'}
                  <img src={item.thumbnail} alt={item.title} width="40" />
                {:else}
                  <enhanced:img src={item.thumbnail} alt={item.title} sizes="40px" />
                {/if}
              {/if}
              <strong>{item.title}</strong>
            </td>
            <td>{item.published_by}</td>
            <td>{new Date(item.published).toLocaleDateString()}</td>
            <td>{item.note}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No content found for the selected filter.</p>
  {/if}
</div>
