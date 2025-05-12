import type { Config } from '@markdoc/markdoc';

const functions: Config['functions'] = {
  uppercase: {
    transform(parameters) {
      const string = parameters[0];

      return typeof string === 'string' ? string.toUpperCase() : string;
    }
  }
};

export default functions;
