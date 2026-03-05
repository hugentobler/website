<script lang="ts">
import { page } from "$app/state";
</script>

<div class="prose">
    <h1>{page.status}</h1>
    <h2>{page.error?.message || "Unknown error"}</h2>
    {#if import.meta.env.DEV}
        {#if page.error?.json}
            <pre>{JSON.stringify(page.error?.json, null, 2)}</pre>
        {/if}
    {/if}
</div>
