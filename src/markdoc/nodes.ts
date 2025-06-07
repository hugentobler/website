import type { Config } from 'markdoc-svelte';
import { Markdoc } from 'markdoc-svelte';

const nodes: Config['nodes'] = {
  document: {
    ...Markdoc.nodes.document,
    render: '' // Disable default wrapping in <article>
  },
  heading: {
    attributes: {
      ...Markdoc.nodes.heading.attributes
    },
    transform(node, config) {
      const attributes = node.transformAttributes(config);
      const children = node.transformChildren(config);
      const id = children
        .filter((child) => typeof child === 'string')
        .join(' ')
        .replace(/[?]/g, '')
        .split(' ')
        .slice(0, 5) // Keep the first 5 words
        .join('-')
        .toLowerCase();

      attributes['id'] = id;
      return new Markdoc.Tag(`h${node.attributes['level']}`, attributes, children);
    }
  },
  image: {
    render: 'EnhancedImage',
    attributes: {
      ...Markdoc.nodes.image.attributes
    }
  },
  link: {
    render: 'DecoratedLink',
    attributes: {
      ...Markdoc.nodes.link.attributes
    },
    transform(node, config) {
      console.log(node.attributes);
      const attributes = node.transformAttributes(config);
      const children = node.transformChildren(config);
      // If the link is external, open in a new tab
      let target = '_self';
      try {
        const url = new URL(attributes.href);
        if (url.hostname) target = '_blank';
      } catch {
        // If the URL is invalid, do nothing
      }
      return new Markdoc.Tag('DecoratedLink', { ...attributes, target }, children);
    }
  }
};

export default nodes;
