<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import type { ContentType } from '$lib/types/library.js';

  let { data }: { data: PageData } = $props();

  // Get filter from URL search params using Svelte 5 $derived rune
  let currentFilter = $derived(page.url.searchParams.get('type') || 'all');
  
  // Filter content based on current filter
  let filteredContent = $derived(currentFilter === 'all' 
    ? data.items 
    : data.items.filter(item => item.type === currentFilter));

  // Get unique content types for filter buttons
  let contentTypes = $derived(Array.from(new Set(data.items.map(item => item.type))));

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
      {@const count = data.items.filter(item => item.type === type).length}
      <button onclick={() => setFilter(type)}>
        {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
      </button>
    {/each}

    {#if currentFilter !== 'all'}
      <button onclick={clearFilter}>
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
          <th>Review</th>
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
              {:else if item.type === 'photograph'}
                {#if item.enhancedImage}
                  <enhanced:img src={item.enhancedImage} alt={item.title} sizes="40px" />
                {:else}
                  <img src={item.externalUrl || ''} alt={item.title} width="40" />
                {/if}
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
              {:else if item.type === 'webpage'}
                {item.content}
                {#if item.tags && item.tags.length > 0}
                  <br>{item.tags.map(tag => `#${tag}`).join(' ')}
                {/if}
              {:else if item.type === 'photograph'}
                {#if item.caption}{item.caption}{/if}
                {#if item.location}<br>📍 {item.location}{/if}
                {#if item.camera}<br>📷 {item.camera}{/if}
              {/if}
            </td>
            <td>{new Date(item.date).toLocaleDateString()}</td>
            <td>{item.review || ''}</td>
            <td>
              {#if item.type === 'book' && item.slug}
                <a href="https://literal.club/book/{item.slug}" target="_blank" rel="noopener">
                  Literal
                </a>
              {:else if item.type === 'webpage' && item.url}
                <a href={item.url} target="_blank" rel="noopener">
                  View
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
