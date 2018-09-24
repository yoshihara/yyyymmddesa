'use strict';

import '../sass/content.sass';

import Extractor from './lib/extractor.js';
import Fetcher from './lib/fetcher.js';
import UI from './lib/ui.js';

const match = window.location.pathname.match(/^\/posts\/(\d+)$/);

if (match) {
  const ui = new UI();
  const id = match[1];
  const { root, date, name, teamName } = Extractor.currentPostInfo();

  if (date && name && teamName) {
    const fetcher = new Fetcher(teamName);
    ui.prepare();
    ui.showLoading();

    (async (date, root, name, id) => {
      await fetcher.init();
      await fetcher
        .fetch(date, root, name, id)
        .then((scope) => {
          if (scope.isValidPrevPost || scope.isValidNextPost) {
            ui.showLinks(scope);
          } else {
            ui.remove();
          }
        })
        .catch((err) => {
          console.log('Error occured in fetch:');
          console.error(err);
          ui.remove();
          return;
        });
    })(date, root, name, id);
  }
}
