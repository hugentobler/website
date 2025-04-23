import Markdoc from '@markdoc/markdoc';

/**
 * @type {import('@markdoc/markdoc').Schema}
 */
const link = {
  attributes: {
    ...Markdoc.nodes.link.attributes,
    target: {
      type: String
    }
  },
  /**
   * Transform function for the paragraph node
   * @param {import('@markdoc/markdoc').Node} node
   * @param {import('@markdoc/markdoc').Config} config
   * @returns {import('@markdoc/markdoc').RenderableTreeNodes}
   */
  transform(node, config) {
    console.log(node);
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Markdoc.Tag('a', { ...attributes }, children);
  }
};

export default link;
