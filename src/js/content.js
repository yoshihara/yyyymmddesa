'use strict';

import '../sass/content.sass';

import Extractor from './lib/extractor.js';
import UI from './lib/ui.js';
import Scope from './lib/scope.js';

const match = window.location.pathname.match(/^\/posts\/(\d+)$/);

if (match) {
  const ui = new UI();
  const id = match[1];
  const { root, date, name, teamName } = Extractor.currentPostInfo();

  if (date && name && teamName) {
    ui.prepare();
    ui.showLoading();

    const message = {
      contentScriptQuery: 'fetchEsaPosts',
      teamName,
      date,
      root,
      name,
      id,
    };
    chrome.runtime.sendMessage(message, ({ posts, id }, error) => {
      if (error) {
        console.log('Error occured in fetch:');
        console.error(error);

        ui.remove();
        return;
      }

      const scope = new Scope(posts, id);
      if (scope.isValidPrevPost || scope.isValidNextPost) {
        ui.showLinks(scope);
      } else {
        ui.remove();
      }
    });
  }
}
