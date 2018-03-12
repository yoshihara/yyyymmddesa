"use strict";

import style from "../sass/content.sass";
import moment from "moment";

import Extractor from "./lib/extractor.js";
import Fetcher from "./lib/fetcher.js";
import UI from "./lib/ui.js";

const path = window.location.pathname;
const match = window.location.pathname.match(/^\/posts\/(\d+)$/);

if (match) {
  const ui = new UI();
  const id = match[1];
  const { root, date, name } = Extractor.currentPostInfo();

  if (root && date && name) {
    const fetcher = new Fetcher();
    ui.showLoading();

    (async (date, root, name, id) => {
      await fetcher.init();
      await fetcher
        .fetchRange(date, root, name, id)
        .then(range => {
          ui.showLinks(range);
        })
        .catch(err => {
          console.log("Error occured in fetch:");
          console.error(err);
          // TODO: uiでloadingを消すメソッドをつけて呼ぶ
          return;
        });
    })(date, root, name, id);
  }
}
