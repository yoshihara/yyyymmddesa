"use strict";

import $ from "jquery";

export default class UI {
  constructor() {
    this.displayedTarget = false;
    this.headDom = $("#comments").parent();
    this.dom = null;
  }

  showLoading() {
    let spinner = `<div id='yyyymmddesa-loading'><i class='fa fa-spinner fa-spin'></i></div>`;
    let dom = $(`<div class='row' id='yyyymmddesa-appended'>${spinner}</div>`);

    this.headDom.before(dom);
    this.dom = dom;
  }

  showLinks(range) {
    if (this.dom == null) return;

    let { prevPost, nextPost } = range;
    this.dom.empty();

    if (prevPost) {
      this.dom.append(
        `<div id='yyyymmddesa-prev-link'><a href='${prevPost.url}'>${
          prevPost.full_name
        }</a></div>`
      );
    }

    if (nextPost) {
      this.dom.append(
        `<div id='yyyymmddesa-next-link'><a href='${nextPost.url}'>${
          nextPost.full_name
        }</a></div>`
      );
    }

    if (prevPost || nextPost) {
      const description = "This links are created by yyyymmddesa.";
      const descriptionDom = `<div id='yyyymmddesa-description'>${description}</div>`;
      this.dom.append(descriptionDom);
    }
  }
}
