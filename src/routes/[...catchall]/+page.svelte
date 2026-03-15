<script lang="ts">
import type { PageProps } from "./$types";

let { data }: PageProps = $props();
</script>

<svelte:head>
    <title>{data.markdown.frontmatter?.title ?? "Undefined title"}</title>
</svelte:head>

<div class="font-sans" data-t8r-root><data.markdown.default /></div>
