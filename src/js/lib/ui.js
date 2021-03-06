'use strict';

import $ from 'jquery';

export default class UI {
  constructor() {
    this.headDom = $('#comments').parent();
    this.dom = null;
  }

  prepare() {
    let dom = $(`<div class='row link' id='yyyymmddesa-appended'></div>`);
    this.dom = dom;
    this.headDom.before(this.dom);
  }

  showLoading() {
    if (this.dom == null) return;

    let spinner = $(
      "<div id='yyyymmddesa-loading'><i class='fa fa-spinner fa-spin'></i></div>",
    );
    this.dom.wrapInner(spinner);
  }

  remove() {
    this.dom.remove();
  }

  showLinks(scope) {
    if (this.dom == null) return;

    let { prevPost, nextPost } = scope;
    this.dom.empty();

    if (prevPost) {
      this.dom.append(
        `<div id='yyyymmddesa-prev-link'><a href='${prevPost.url}'>${
          prevPost.full_name
        }</a></div>`,
      );
    }

    if (nextPost) {
      this.dom.append(
        `<div id='yyyymmddesa-next-link'><a href='${nextPost.url}'>${
          nextPost.full_name
        }</a></div>`,
      );
    }

    if (prevPost || nextPost) {
      const description = 'This links are created by yyyymmddesa.';
      const descriptionDom = `<div id='yyyymmddesa-description'>${description}</div>`;
      this.dom.append(descriptionDom);
    }
  }
}
