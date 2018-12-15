'use strict';

import $ from 'jquery';
import moment from 'moment';

export default class Extractor {
  static currentPostInfo() {
    const match = this.category().match(/^\/(.+\/)?(\d\d\d\d\/\d\d\/\d\d)$/);
    if (!match) return {};

    const root = match[1] !== undefined ? match[1].replace('/', '') : '';
    const yearAndMonth = match[2];
    const date = new moment(yearAndMonth, 'YYYY/MM/DD');

    const name = this.name();
    const teamName = this.teamName();

    return { root, date, name, teamName };
  }

  static category() {
    const categoryItem = $('.post-header')
      .find('.category-path')
      .children('.category-path__item');
    let categoryPath = '';

    for (let i = 0; i < categoryItem.length; i++) {
      let category = $(categoryItem[i])
        .text()
        .replace(/[ \n]/g, '');
      categoryPath = `${categoryPath}/${category}`;
    }

    return categoryPath;
  }

  static name() {
    let createdByText = $('.post-header')
      .find('.post-header__meta')
      .find('.post-author')
      .find('.post-author__user')[0].textContent;

    return createdByText
      .replace(/\r?\n/g, '')
      .replace(/Created by/, '')
      .trim();
  }

  static teamName() {
    return window.location.hostname.replace('.esa.io', '');
  }
}
