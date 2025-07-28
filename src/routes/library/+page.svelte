<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();

  const currentTypeFilter = $derived(page.url.searchParams.get('type') || 'all');
  const currentDecadeFilter = $derived(page.url.searchParams.get('decade') || 'all');

  const contentTypes = $derived(Array.from(new Set(data.items.map((item) => item.type))));

  const filteredContent = $derived(
    data.items.filter((item) => {
      const typeMatch = currentTypeFilter === 'all' || item.type === currentTypeFilter;
      const decadeMatch = currentDecadeFilter === 'all' || 
        Math.floor(new Date(item.published).getFullYear() / 10) * 10 === parseInt(currentDecadeFilter);
      return typeMatch && decadeMatch;
    })
  );

  const hasActiveFilters = $derived(currentTypeFilter !== 'all' || currentDecadeFilter !== 'all');

  function setFilter(type?: string, decade?: string) {
    const url = new URL(page.url);
    
    if (type !== undefined) {
      if (type === 'all') {
        url.searchParams.delete('type');
      } else {
        url.searchParams.set('type', type);
      }
    }
    
    if (decade !== undefined) {
      if (decade === 'all') {
        url.searchParams.delete('decade');
      } else {
        url.searchParams.set('decade', decade);
      }
    }
    
    goto(url, { keepFocus: true });
  }
</script>

<svelte:head>
  <title>Library</title>
</svelte:head>

<style>
  .filter-section {
    margin-bottom: 1rem;
  }
  
  .filter-section strong {
    display: inline-block;
    margin-right: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  button.active {
    font-weight: bold;
    text-decoration: underline;
  }
  
  .current-filters {
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .current-filters h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  .filter-tag {
    display: inline-block;
    border: 1px solid #999;
    padding: 0.25rem 0.5rem;
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
  
  .clear-filters {
    margin-top: 0.5rem;
  }
</style>

<div>
  <h1>Library</h1>

  <!-- Current Filters -->
  {#if hasActiveFilters}
    <div class="current-filters">
      <h3>Current Filters:</h3>
      {#if currentTypeFilter !== 'all'}
        <span class="filter-tag">
          Type: {currentTypeFilter.charAt(0).toUpperCase() + currentTypeFilter.slice(1)}s
        </span>
      {/if}
      {#if currentDecadeFilter !== 'all'}
        <span class="filter-tag">
          Decade: {currentDecadeFilter}s
        </span>
      {/if}
      <div class="clear-filters">
        <button onclick={() => setFilter('all', 'all')}>Clear All Filters</button>
      </div>
    </div>
  {/if}

  <!-- Filter Controls -->
  <div class="filter-controls">
    <!-- Type Filters -->
    <div class="filter-section">
      <strong>Content Type:</strong>
      {#each contentTypes as type}
        {@const count = data.items.filter((item) => item.type === type).length}
        <button 
          onclick={() => setFilter(type)} 
          class:active={currentTypeFilter === type}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
        </button>
      {/each}
    </div>

    <!-- Decade Filters -->
    <div class="filter-section">
      <strong>Decade:</strong>
      {#each data.decades as decade}
        {@const count = data.items.filter((item) => 
          Math.floor(new Date(item.published).getFullYear() / 10) * 10 === decade
        ).length}
        <button 
          onclick={() => setFilter(undefined, decade.toString())} 
          class:active={currentDecadeFilter === decade.toString()}
        >
          {decade}s ({count})
        </button>
      {/each}
    </div>
  </div>

  <!-- Content List -->
  {#if filteredContent.length > 0}
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
                  <img src={item.thumbnail} alt={item.title} width="160" />
                {:else}
                  <enhanced:img src={item.thumbnail} alt={item.title} sizes="160px" />
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
