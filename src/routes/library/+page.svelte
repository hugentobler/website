<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  // Parse URL params into arrays of filter values
  const activeMediums = $derived(
    page.url.searchParams.get("medium")?.split("-").filter(Boolean) || [],
  );

  const activeYears = $derived(
    page.url.searchParams.get("year")?.split("-").filter(Boolean) || [],
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
    const currentValues = filterType === "medium" ? activeMediums : activeYears;
    if (currentValues.includes(value)) return; // Already active

    const url = new URL(page.url);
    const newValues = [...currentValues, value];
    url.searchParams.set(filterType, newValues.join("-"));
    goto(url, { keepFocus: true });
  }

  // Clear all filters
  function clearAllFilters() {
    const url = new URL(page.url);
    url.searchParams.delete("medium");
    url.searchParams.delete("year");
    goto(url, { keepFocus: true });
  }
</script>

<svelte:head>
  <title>Library</title>
</svelte:head>

<div>
  <h1>Library</h1>

  <!-- Active Filters Display -->
  {#if hasActiveFilters}
    <div class="current-filters">
      <h3>Current Filters:</h3>
      {#if activeMediums.length > 0}
        <span class="filter-tag">
          Mediums: {activeMediums
            .map((medium) => medium.charAt(0).toUpperCase() + medium.slice(1))
            .join(", ")}
        </span>
      {/if}
      {#if activeYears.length > 0}
        <span class="filter-tag">
          Years: {activeYears.map((year) => year + "s").join(", ")}
        </span>
      {/if}
      <div class="clear-filters">
        <button onclick={clearAllFilters}> Clear All Filters </button>
      </div>
    </div>
  {/if}

  <!-- Filter Controls -->
  <div class="filter-controls">
    <!-- Content Medium Filters -->
    <div class="filter-section">
      <strong>Medium:</strong>
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

    <!-- Year Filters -->
    <div class="filter-section">
      <strong>Year:</strong>
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
        {#each filteredItems as item}
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
            <td>{new Date(item.published).toLocaleDateString()}</td>
            <td>{item.note || ""}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No content found for the selected filters.</p>
  {/if}
</div>

<style>
  /* Filter sections styling */
  .filter-section {
    margin-bottom: 1rem;
  }

  .filter-section strong {
    display: inline-block;
    margin-right: 0.5rem;
    margin-bottom: 0.25rem;
  }

  /* Button styling */
  button.active {
    font-weight: bold;
    text-decoration: underline;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:disabled:hover {
    text-decoration: none;
  }

  /* Current filters display */
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
