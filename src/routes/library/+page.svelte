<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { browser } from "$app/environment";
import type { PageData } from "./$types";

const { data }: { data: PageData } = $props();

// Parse URL params into arrays of filter values - only in browser
const activeMediums = $derived(
	(browser && page.url.searchParams.get("medium")?.split("-").filter(Boolean)) || [],
);

const activeYears = $derived(
	(browser && page.url.searchParams.get("year")?.split("-").filter(Boolean)) || [],
);

// Check if any filters are active
const hasActiveFilters = $derived(activeMediums.length > 0 || activeYears.length > 0);

// Filter items based on URL params
const filteredItems = $derived(
	data.items.filter((item) => {
		const mediumMatch = activeMediums.length === 0 || activeMediums.includes(item.type);

		const yearMatch = activeYears.length === 0 || activeYears.includes(item.decade.toString());

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

<div class="grid grid-cols-5 gap-8 mt-8">
  {#if filteredItems.length > 0}
    {#each filteredItems as item (item.id)}
      <article
        class="group relative transition-all duration-150 flex flex-col gap-2"
      >
        <div class="font-mono text-sm font-bold tracking-tighter">
          {new Date(item.published).getFullYear()}
        </div>
        <!-- Image container with hover overlay -->
        <div class="relative">
          {#if item.type === "book"}
            {#if item.thumbnail}
              {#if typeof item.thumbnail === "string"}
                <img
                  src={item.thumbnail}
                  alt="{item.title} by {item.published_by}"
                  class="w-full"
                />
              {:else}
                <enhanced:img
                  src={item.thumbnail}
                  alt="{item.title} by {item.published_by}"
                  sizes="300px"
                  class="w-full h-full object-cover"
                />
              {/if}
            {:else}
              <div
                class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500"
                aria-label="No image available for {item.title}"
              >
                <span class="text-center">
                  <div class="text-sm font-medium">{item.title}</div>
                  <div class="text-xs">by {item.published_by}</div>
                </span>
              </div>
            {/if}
          {:else if item.type === "webpage"}
            <div
              class="w-full h-full bg-white border border-gray-300 flex items-center justify-center p-6"
            >
              <div class="text-center text-black">
                <h3 class="text-base font-bold mb-2 leading-tight">
                  {item.title}
                </h3>
                <div class="text-xs text-gray-500">Website</div>
              </div>
            </div>
          {:else if item.type === "photograph"}
            {#if item.thumbnail}
              {#if typeof item.thumbnail === "string"}
                <img
                  src={item.thumbnail}
                  alt="{item.title} by {item.published_by}"
                  class="w-full h-full object-cover"
                />
              {:else}
                <enhanced:img
                  src={item.thumbnail}
                  alt="{item.title} by {item.published_by}"
                  sizes="300px"
                  class="w-full h-full object-cover"
                />
              {/if}
            {:else}
              <div
                class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500"
                aria-label="No image available for {item.title}"
              >
                <span class="text-center">
                  <div class="text-sm font-medium">{item.title}</div>
                  <div class="text-xs">by {item.published_by}</div>
                </span>
              </div>
            {/if}
          {/if}

          <!-- Hover overlay with metadata -->
          <div
            class="absolute bottom-0 inset-x-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 flex items-end opacity-0 group-hover:opacity-100"
          >
            <div class="text-white w-full">
              <h3 class="text-sm">{item.title} by {item.published_by}</h3>
            </div>
          </div>
        </div>

        <!-- Note displayed underneath if it exists -->
        {#if item.note}
          <div class="">
            <p class="text-sm">
              {item.note}
            </p>
          </div>
        {/if}

        <!-- Screen reader only content -->
        <div class="sr-only">
          <h3>{item.title} by {item.published_by}</h3>
          <p>Published in {new Date(item.published).getFullYear()}</p>
          <p>Type: {item.type}</p>
          {#if item.note}
            <p>Note: {item.note}</p>
          {/if}
        </div>
      </article>
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
</style>
