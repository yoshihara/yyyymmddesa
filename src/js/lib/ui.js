"use strict";

import $ from "jquery";

export default class UI {
  constructor() {
    this.displayedTarget = false;
    this.headDom = $("#comments").parent();
    this.dom = null;
  }

  // TODO styleをstyle DOM作って入れてクラスで見れるようにする
  showLoading() {
    let spinner = `<div class='yyyymmddesa-loading'><i class='fa fa-spinner fa-spin'></i></div>`;
    let dom = $(`<div class='row yyyymmddesa-appended'>${spinner}</div>`);

    this.headDom.before(dom);
    this.dom = dom;
  }

  showLinks(range) {
    if (this.dom == null) return;

    let { prevPost, nextPost } = range;
    this.dom.empty();

    if (prevPost) {
      this.dom.append(
        `<div style='float:left;'><a href='${prevPost.url}'>${
          prevPost.full_name
        }</a></div>`
      );
    }

    if (nextPost) {
      this.dom.append(
        `<div style='float:right;'><a href='${nextPost.url}'>${
          nextPost.full_name
        }</a></div>`
      );
    }

    if (prevPost || nextPost) {
      const description =
        "<i class='fa fa-calendar'></i> This links created by yyyymmddesa.";
      const descriptionDom = `<div style='clear: both; padding-top: 20px; text-align: right; color: rgba(0,0,0,.2);'>${description}</div>`;
      this.dom.append(descriptionDom);
    }
  }
}
