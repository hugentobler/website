import Markdoc from '@markdoc/markdoc';

const { Tag, nodes } = Markdoc;
/**
 * @typedef {import('@markdoc/markdoc').Config} Config
 * @typedef {import('@markdoc/markdoc').Node} Node
 */

export const image = {
  render: 'img',
  attributes: {
    ...nodes.image.attributes
  },
  /**
   * @param {Node} node
   * @param {Config} config
   */
  transform: function (node, config) {
    console.log('Node:', node);
    console.log('Config:', config);
    return new Tag(this.render, {
      ...node.attributes,
      ...node.transformAttributes(config),
      children: node.transformChildren(config)
    });
  }
};
