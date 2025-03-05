<script lang="ts">
  import DecoratedLink from '$lib/components/DecoratedLink.svelte';
  import Image from '$lib/markdoc/Image.svelte';
  import type { MarkdocLayoutProps } from '$lib/markdoc/types';

  import Page from './+page.svelte';

  let { data } = $props() as MarkdocLayoutProps;

  const components = {
    a: DecoratedLink,
    img: Image
  };
</script>

<article class="bg-blue-100">
  <Page {components} {data} />
</article>
