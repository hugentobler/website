import type { Config } from '@markdoc/markdoc';

// @ts-expect-error include .ts extension for dynamic import
import name from './name.ts';

const variables: Config['variables'] = {
  name
};

export default variables;
