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

<div>
  <!-- Content List -->
  {#if filteredItems.length > 0}
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
        {#each filteredItems as item (item.id)}
          <tr>
            <td>{item.type}</td>
            <td>
              {#if item.thumbnail}
                {#if typeof item.thumbnail === "string"}
                  <img src={item.thumbnail} alt={item.title} width="160" />
                {:else}
                  <enhanced:img
                    src={item.thumbnail}
                    alt={item.title}
                    sizes="160px"
                  />
                {/if}
              {/if}
              <strong>{item.title}</strong>
            </td>
            <td>{item.published_by}</td>
            <td>{new Date(item.published).getFullYear()}</td>
            <td>{item.note || ""}</td>
          </tr>
        {/each}
      </tbody>
    </table>
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
