import Fetcher from './lib/fetcher.js';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.contentScriptQuery == 'fetchEsaPosts') {
    (async () => {
      const { teamName, date, root, name, id } = request;
      const fetcher = new Fetcher(teamName);
      await fetcher.init();
      await fetcher
        .fetch(date, root, name, id)
        .then(({ posts, id }) => {
          sendResponse({ posts, id }, null);
        })
        .catch((err) => {
          console.error(err);
          sendResponse(null, null, err);
        });
    })();
  }
  return true;
});
