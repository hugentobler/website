<!--
@component
Renders a Markdoc tree into Svelte components and HTML elements. Handles both custom components and standard HTML elements recursively through the tree structure.

@prop {RenderableTreeNode[]} children - The Markdoc render tree nodes to process. Can contain both Tag nodes (for HTML/components) and string nodes (for text content).
@prop {Record<string, Component>} components - Map of tag names to custom Svelte components. When a tag name matches a key in this map, the custom component is used instead of the default HTML element.

@example
```svelte
<script>
  import Image from './Image.svelte';
  
  const components = {
    img: Image  // Use custom Image component for img tags
  };
</script>

<RenderMarkdoc children={markdocContent.children} {components} />
```
-->

<script lang="ts">
  import type { Component } from 'svelte';

  import type { RenderableTreeNode, Tag } from '@markdoc/markdoc';

  import Render from './render.svelte';

  let {
    children,
    components
  }: {
    // The children prop contains the Markdoc render tree
    // Each node can be either a Tag (like h1, p, blockquote) or a string
    children: RenderableTreeNode[];
    // Map of custom components to use instead of default HTML elements
    // e.g. { img: CustomImageComponent }
    components: Record<string, Component>;
  } = $props();

  // Defines the shape of a processed node ready for rendering
  type RenderedNode = {
    component: Component | string; // Either a Svelte component or HTML tag name
    props: Record<string, unknown>; // Attributes passed to the component/element
    children: RenderableTreeNode[]; // Nested content to render
    isHtmlElement: boolean; // Whether to render as HTML or component
  };

  /**
   * Processes a node from the Markdoc tree for rendering
   * @param node - Either a Tag object or a string
   * @returns Either a RenderedNode (for Tags) or a string (for text content)
   */
  const renderNode = (node: RenderableTreeNode): RenderedNode | string => {
    // Text nodes can be rendered directly
    if (typeof node === 'string') {
      return node;
    }

    // Cast to Tag type to access name, attributes, and children
    const tag = node as Tag;

    return {
      // Use custom component if available, otherwise use HTML tag name
      component: components[tag.name] ?? tag.name,
      // Pass through attributes, defaulting to empty object
      props: tag.attributes || {},
      // Pass through children, defaulting to empty array
      children: tag.children || [],
      // If we don't have a custom component, treat as HTML element
      isHtmlElement: !(tag.name in components)
    };
  };
</script>

{#each children as child}
  {@const rendered = renderNode(child)}
  {#if typeof rendered === 'string'}
    <!-- Render text nodes directly -->
    {rendered}
  {:else if rendered.isHtmlElement}
    <!-- Render HTML elements using svelte:element -->
    <svelte:element this={rendered.component as string} {...rendered.props}>
      {#if rendered.children?.length}
        <!-- Recursively render nested children -->
        <Render children={rendered.children} {components} />
      {/if}
    </svelte:element>
  {:else}
    <!-- Render custom components -->
    {@const Component = rendered.component as Component}
    <Component {...rendered.props}>
      {#if rendered.children?.length}
        <!-- Recursively render nested children -->
        <Render children={rendered.children} {components} />
      {/if}
    </Component>
  {/if}
{/each}
