import type { Config } from '@markdoc/markdoc';
import Markdoc from '@markdoc/markdoc';

const nodes: Config['nodes'] = {
  link: {
    attributes: {
      ...Markdoc.nodes.link.attributes
    },
    transform(node, config) {
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
      return new Markdoc.Tag('a', { ...attributes, target }, children);
    }
  },
  paragraph: {
    attributes: {
      ...Markdoc.nodes.paragraph.attributes,
      class: { type: String }
    },
    transform(node, config) {
      const attributes = node.transformAttributes(config);
      const children = node.transformChildren(config);
      return new Markdoc.Tag('p', attributes, children);
    }
  }
};

export default nodes;
