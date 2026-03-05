<script lang="ts">
import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { page } from "$app/state";
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

<!-- Main page grid with 3 vertical sections -->
<div class="min-h-screen grid grid-rows-[auto_auto_1fr] gap-8 p-4">
  <!-- Navigation section -->
  <nav class="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-black pb-6">
    <div>
      <h1 class="text-2xl font-bold">My Library</h1>
    </div>
    <div>
      <ul class="flex gap-4 text-sm">
        <li>Home</li>
        <li>Resume</li>
        <li>Typography</li>
      </ul>
    </div>
    <div>
      <p class="text-sm text-gray-600">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    </div>
  </nav>

  <!-- Filters section -->
  <section class="border-b border-black pb-6">
    <div class="grid grid-cols-[auto_1fr_1fr] gap-8 items-start">
      <!-- Current filters / Clear all -->
      <div class="min-w-0">
        <h2 class="text-lg font-semibold mb-3">Filters</h2>
        {#if hasActiveFilters}
          <div class="space-y-2">
            <div class="text-sm text-gray-600">
              Active: {[
                ...activeMediums.map(
                  (medium) => medium.charAt(0).toUpperCase() + medium.slice(1),
                ),
                ...activeYears.map((year) => year + "s"),
              ].join(", ")}
            </div>
            <button
              onclick={clearAllFilters}
              class="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              Clear All
            </button>
          </div>
        {:else}
          <div class="text-sm text-gray-500">No filters active</div>
        {/if}
      </div>

      <!-- Medium filters -->
      <div class="min-w-0">
        <h3 class="text-base font-semibold mb-3">Medium</h3>
        <div class="flex flex-wrap gap-2">
          {#each data.types as medium}
            {@const count = getMediumCount(medium)}
            {@const isActive = activeMediums.includes(medium)}
            <button
              onclick={() => addFilter("medium", medium)}
              class="text-sm px-3 py-1 rounded border transition-colors {isActive
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'}"
              disabled={count === 0 || isActive}
            >
              {medium.charAt(0).toUpperCase() + medium.slice(1)}s ({count})
            </button>
          {/each}
        </div>
      </div>

      <!-- Year filters -->
      <div class="min-w-0">
        <h3 class="text-base font-semibold mb-3">Year</h3>
        <div class="flex flex-wrap gap-2">
          {#each data.decades as year}
            {@const yearStr = year.toString()}
            {@const count = getYearCount(yearStr)}
            {@const isActive = activeYears.includes(yearStr)}
            <button
              onclick={() => addFilter("year", yearStr)}
              class="text-sm px-3 py-1 rounded border transition-colors {isActive
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'}"
              disabled={isActive}
            >
              {year}s ({count})
            </button>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Content grid section -->
  <main class="flex-1">
    {#if filteredItems.length > 0}
      <div class="grid grid-cols-6 gap-24 auto-rows-max">
        {#each filteredItems as item (item.id)}
          <article class="group">
            <!-- Image or text fallback -->
            {#if item.type === "book" && item.thumbnail}
              {@const thickness = item.thickness || 12}
              <div
                class="relative book-3d-container"
                style="transform-style: preserve-3d;"
              >
                <!-- Front face (book cover) -->
                <div class="book-front relative z-10">
                  <enhanced:img
                    src={item.thumbnail}
                    alt="{item.title} by {item.published_by}"
                    class="w-full h-auto object-cover block"
                  />
                </div>
                <!-- Right side (connecting to depth) with overlap -->
                <div
                  class="book-side-right absolute top-0 bg-gray-600 z-0"
                  style="left: calc(100% - 1px); width: {thickness}px; height: 100%; transform: skewY(45deg); transform-origin: left top;"
                ></div>
                <!-- Bottom side (connecting to depth) with overlap -->
                <div
                  class="book-side-bottom absolute left-0 bg-gray-500 z-0"
                  style="top: calc(100% - 1px); width: 100%; height: {thickness}px; transform: skewX(45deg); transform-origin: left top;"
                ></div>
              </div>
            {:else if item.type === "photograph" && item.thumbnail}
              {#if typeof item.thumbnail === "string"}
                <img
                  src={item.thumbnail}
                  alt="{item.title} by {item.published_by}"
                  class="w-full h-auto object-cover"
                  loading="lazy"
                />
              {:else}
                <enhanced:img
                  src={item.thumbnail}
                  alt="{item.title} by {item.published_by}"
                  class="w-full h-auto object-cover"
                />
              {/if}
            {:else}
              <!-- Text fallback for items without images -->
              <div
                class="w-full bg-gray-50 border border-gray-200 rounded p-4 flex flex-col justify-center min-h-32"
              >
                <h3
                  class="text-sm font-semibold leading-tight mb-2 line-clamp-3"
                >
                  {item.title}
                </h3>
                <div class="text-xs text-gray-600 mt-auto">
                  by {item.published_by}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {new Date(item.published).getFullYear()}
                </div>
              </div>
            {/if}

            <!-- Screen reader content -->
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
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-gray-500">No content found for the selected filters.</p>
        {#if hasActiveFilters}
          <button
            onclick={clearAllFilters}
            class="mt-4 text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Clear Filters
          </button>
        {/if}
      </div>
    {/if}
  </main>
</div>
