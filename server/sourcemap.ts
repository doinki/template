import { readFileSync } from 'node:fs';

import sourceMapSupport from 'source-map-support';

sourceMapSupport.install({
  retrieveSourceMap(source) {
    const match = /^file:\/\/(.*)\?t=[\d.]+$/.exec(source);

    if (match) {
      return {
        map: readFileSync(`${match[1]}.map`, 'utf8'),
        url: source,
      };
    }

    return null;
  },
});
