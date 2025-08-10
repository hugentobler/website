<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  // Parse URL params into arrays of filter values - only in browser
  const activeMediums = $derived(
    (browser &&
      page.url.searchParams.get("medium")?.split("-").filter(Boolean)) ||
      [],
  );

  const activeYears = $derived(
    (browser &&
      page.url.searchParams.get("year")?.split("-").filter(Boolean)) ||
      [],
  );

  // Check if any filters are active
  const hasActiveFilters = $derived(
    activeMediums.length > 0 || activeYears.length > 0,
  );

  // Filter items based on URL params
  const filteredItems = $derived(
    data.items.filter((item) => {
      const mediumMatch =
        activeMediums.length === 0 || activeMediums.includes(item.type);

      const yearMatch =
        activeYears.length === 0 ||
        activeYears.includes(item.decade.toString());

      return mediumMatch && yearMatch;
    }),
  );

  // Get count for a specific medium
  function getMediumCount(medium: string): number {
    return data.items.filter((item) => item.type === medium).length;
  }

  // Get count for a specific year
  function getYearCount(year: string): number {
    return data.items.filter((item) => item.decade.toString() === year).length;
  }

  // Add a filter (medium or year)
  function addFilter(filterType: "medium" | "year", value: string) {
    if (!browser) return; // Guard against SSR

    const currentValues = filterType === "medium" ? activeMediums : activeYears;
    if (currentValues.includes(value)) return; // Already active

    const url = new URL(page.url);
    const newValues = [...currentValues, value];
    url.searchParams.set(filterType, newValues.join("-"));
    goto(url, { keepFocus: true });
  }

  // Clear all filters
  function clearAllFilters() {
    if (!browser) return; // Guard against SSR

    const url = new URL(page.url);
    url.searchParams.delete("medium");
    url.searchParams.delete("year");
    goto(url, { keepFocus: true });
  }
</script>

<svelte:head>
  <title>bibliothèque</title>
</svelte:head>

<div class="filters">
  <div>
    <h2>Filters</h2>
    {#if hasActiveFilters}
      <div>
        <h3>Current Filters:</h3>
        <span>
          {[
            ...activeMediums.map(
              (medium) => medium.charAt(0).toUpperCase() + medium.slice(1),
            ),
            ...activeYears.map((year) => year + "s"),
          ].join(", ")}
        </span>
        <div>
          <button onclick={clearAllFilters}>Clear Filters</button>
        </div>
      </div>
    {/if}
  </div>
  <div>
    <h2>Medium</h2>
    <div class="filter-list">
      {#each data.types as medium}
        {@const count = getMediumCount(medium)}
        {@const isActive = activeMediums.includes(medium)}
        <button
          onclick={() => addFilter("medium", medium)}
          class:active={isActive}
          disabled={count === 0 || isActive}
        >
          {medium.charAt(0).toUpperCase() + medium.slice(1)}s ({count})
        </button>
      {/each}
    </div>
  </div>
  <div>
    <h2>Year</h2>
    <div class="filter-list">
      {#each data.decades as year}
        {@const yearStr = year.toString()}
        {@const count = getYearCount(yearStr)}
        {@const isActive = activeYears.includes(yearStr)}
        <button
          onclick={() => addFilter("year", yearStr)}
          class:active={isActive}
          disabled={isActive}
        >
          {year}s ({count})
        </button>
      {/each}
    </div>
  </div>
</div>

<div class="library-grid">
  {#if filteredItems.length > 0}
    {#each filteredItems as item (item.id)}
      <div class="library-item {item.type} border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {#if item.type === 'book'}
          <!-- Book: Show thumbnail -->
          {#if item.thumbnail}
            {#if typeof item.thumbnail === "string"}
              <img src={item.thumbnail} alt={item.title} class="w-full h-48 object-cover" />
            {:else}
              <enhanced:img
                src={item.thumbnail}
                alt={item.title}
                sizes="200px"
                class="w-full h-48 object-cover"
              />
            {/if}
          {:else}
            <div class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>
          {/if}
        {:else if item.type === 'webpage'}
          <!-- Webpage: White background with text overlay -->
          <div class="w-full h-48 bg-white border border-gray-300 flex items-center justify-center p-4">
            <div class="text-center text-black">
              <h3 class="text-lg font-bold mb-2">{item.title}</h3>
              <p class="text-sm text-gray-600 mb-1">{item.published_by}</p>
              <span class="text-xs text-gray-500">{new Date(item.published).getFullYear()}</span>
            </div>
          </div>
        {:else if item.type === 'photograph'}
          <!-- Image: Just show the image -->
          {#if item.thumbnail}
            {#if typeof item.thumbnail === "string"}
              <img src={item.thumbnail} alt={item.title} class="w-full h-48 object-cover" />
            {:else}
              <enhanced:img
                src={item.thumbnail}
                alt={item.title}
                sizes="200px"
                class="w-full h-48 object-cover"
              />
            {/if}
          {:else}
            <div class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">No Image</div>
          {/if}
        {/if}
        
        <!-- Item metadata -->
        <div class="p-4 flex-grow">
          <h4 class="font-bold text-lg mb-2 line-clamp-2">{item.title}</h4>
          <p class="text-sm text-gray-600 mb-2">{item.published_by} • {new Date(item.published).getFullYear()}</p>
          {#if item.note}
            <p class="text-xs text-gray-500 italic">{item.note}</p>
          {/if}
        </div>
      </div>
    {/each}
  {:else}
    <p>No content found for the selected filters.</p>
  {/if}
</div>

<style lang="postcss">
  @reference "../../app.css";

  .filters {
    @apply grid grid-cols-8 gap-4;
    @apply border-b border-b-black;
  }

  .filter-list {
    @apply grid grid-rows-4;
  }

  .library-grid {
    @apply grid grid-cols-4 gap-6 mt-8;
  }

  .library-item {
    @apply flex flex-col;
  }
</style>
