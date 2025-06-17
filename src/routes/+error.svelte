<script lang="ts">
  import { page } from '$app/state';
</script>

<div>
  <h1>Something went wrong!</h1>
  <p><strong>Status:</strong> {page.status}</p>
  <p><strong>Message:</strong> {page.error?.message || 'Unknown error'}</p>
  {#if page.error?.details}
    <p><strong>Details:</strong> {page.error.details}</p>
  {/if}
  
  {#if import.meta.env.DEV}
    <details>
      <summary>Debug info (dev only)</summary>
      <pre>{JSON.stringify(page.error, null, 2)}</pre>
      <pre>{JSON.stringify(page, null, 2)}</pre>
    </details>
  {/if}
</div>
