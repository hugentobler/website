import type { Config } from 'markdoc-svelte';

const tags: Config['tags'] = {
  underline: {
    render: 'Underline',
    children: ['link']
  }
};

export default tags;
