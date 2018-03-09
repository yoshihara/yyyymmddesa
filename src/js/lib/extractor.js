"use strict";

import $ from "jquery";

export default class Extractor {
  static category() {
    const categoryItem = $(".post-header")
      .find(".category-path")
      .children(".category-path__item");
    let categoryPaths = [];

    for (let i = 0; i < categoryItem.length; i++) {
      let li = categoryItem[i];
      categoryPaths = categoryPaths.concat(
        $(li)
          .text()
          .replace(/[ \n]/g, "")
      );
    }

    return categoryPaths.join("/");
  }

  static name() {
    const postTitle = $(".post-header")
      .find(".post-title")
      .find(".post-title__name")
      .text();
    // NOTE: コロン、スペース（半角・全角）、括弧（半角・全角）を名前とタイトルの切れ目とみなす
    const nameAndTitle = postTitle.split(/[: 　（(]/);
    return nameAndTitle[0];
  }
}
