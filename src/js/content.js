"use strict";

import moment from "moment";

import Extractor from "./lib/extractor.js";
import Esa from "./lib/esa.js";
import Fetcher from "./lib/fetcher.js";
import UI from "./lib/ui.js";

const path = window.location.pathname;
const match = window.location.pathname.match(/^\/posts\/(\d+)$/);

if (match) {
  const ui = new UI();
  const id = match[1];
  const { root, date, name } = Extractor.currentPostInfo();

  if (root && date && name) {
    const esa = new Esa;
    const fetcher = new Fetcher(esa);
    ui.showLoading();

    let prevPost, nextPost;

    (async (date, root, name, id) => {
      await fetcher.getRangePosts(date, root, name, id)
        .then(posts => {
          prevPost = posts.prevPost;
          nextPost = posts.nextPost;
        })
        .catch(err => {
          console.log("Error occured in fetch:");
          console.error(err);
          return;
        });

      ui.showLinks(prevPost, nextPost);
    })(date, root, name, id);
  }
}
