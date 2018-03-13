"use strict";

import $ from "jquery";
import moment from "moment";

export default class Extractor {
  static currentPostInfo() {
    const match = this.category().match(/^(.+)\/(\d\d\d\d\/\d\d\/\d\d)$/);

    if (!match) return {};

    const root = match[1];
    const yearAndMonth = match[2];
    const name = this.name();
    const teamName = this.teamName();

    const date = new moment(yearAndMonth, "YYYY/MM/DD");

    return { root, date, name, teamName };
  }

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
    let createdByText = $(".post-header")
      .find(".post-header__meta")
      .find(".post-author")
      .find(".post-author__user")[0].innerText;

    return createdByText.replace(/Created by /, "");
  }

  static teamName() {
    return window.location.hostname.replace(".esa.io", "");
  }
}
