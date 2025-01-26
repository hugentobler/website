<script lang="ts">
  import { page } from '$app/state';
</script>

<p>Custom error page!</p>
<p>Status: {page.status}</p>
<p>Message: {page.error?.message}</p>
