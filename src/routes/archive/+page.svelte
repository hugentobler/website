<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  // Get filter from URL search params
  $: currentFilter = $page.url.searchParams.get('type') || 'all';
  
  // Filter content based on current filter
  $: filteredContent = currentFilter === 'all' 
    ? data.content 
    : data.content.filter(item => item.type === currentFilter);

  // Get unique content types for filter buttons
  $: contentTypes = Array.from(new Set(data.content.map(item => item.type)));

  function setFilter(type: string) {
    const url = new URL($page.url);
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
  <title>Archive</title>
</svelte:head>

<div>
  <h1>Archive</h1>
  
  <p>
    <strong>Last updated:</strong>
    {new Date(data.buildTime).toLocaleString()}
    (statically generated)
  </p>

  <!-- Filter Controls -->
  <div>
    <button on:click={() => setFilter('all')}>
      All ({data.content.length})
    </button>
    
    {#each contentTypes as type}
      {@const count = data.content.filter(item => item.type === type).length}
      <button on:click={() => setFilter(type)}>
        {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
      </button>
    {/each}

    {#if currentFilter !== 'all'}
      <button on:click={clearFilter}>
        Clear Filter
      </button>
    {/if}
  </div>

  <!-- Content List -->
  {#if filteredContent && filteredContent.length > 0}
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Title</th>
          <th>Details</th>
          <th>Date</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredContent as item}
          <tr>
            <td>{item.type}</td>
            <td>
              {#if item.type === 'book' && item.cover}
                <img src={item.cover} alt="Cover" width="40" />
              {:else if item.type === 'photo'}
                <img src={item.url} alt={item.title} width="40" />
              {/if}
              <strong>{item.title}</strong>
              {#if item.type === 'book' && item.subtitle}
                <br><em>{item.subtitle}</em>
              {/if}
            </td>
            <td>
              {#if item.type === 'book'}
                {#if item.authors && item.authors.length > 0}
                  by {item.authors.map(author => author.name).join(', ')}
                {/if}
              {:else if item.type === 'post'}
                {item.content}
                {#if item.tags && item.tags.length > 0}
                  <br>{item.tags.map(tag => `#${tag}`).join(' ')}
                {/if}
              {:else if item.type === 'photo'}
                {#if item.caption}{item.caption}{/if}
                {#if item.location}<br>📍 {item.location}{/if}
                {#if item.camera}<br>📷 {item.camera}{/if}
              {/if}
            </td>
            <td>{new Date(item.date).toLocaleDateString()}</td>
            <td>
              {#if item.type === 'book' && item.slug}
                <a href="https://literal.club/book/{item.slug}" target="_blank" rel="noopener">
                  Literal
                </a>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No content found for the selected filter.</p>
  {/if}
</div>
