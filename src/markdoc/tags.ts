import type { Config } from '@markdoc/markdoc';

const tags: Config['tags'] = {
  underline: {
    render: 'Underline',
    children: ['link']
  }
};

export default tags;
