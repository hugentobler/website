/**
 * @type {import('@markdoc/markdoc').Schema}
 */
export const decoratedLink = {
  render: 'DecoratedLink',
  attributes: {
    href: {
      type: String
    },
    target: {
      type: String,
      default: '_blank'
    }
  }
};

export default decoratedLink;
