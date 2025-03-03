<script lang="ts">
  import Markdoc from '@markdoc/markdoc';

  import Image from '$lib/markdoc/Image.svelte';
  import Render from '$lib/markdoc/Render.svelte';

  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const { content, frontmatter } = data;

  const components = {
    img: Image
  };
</script>

<Render children={content.children} {components} />
