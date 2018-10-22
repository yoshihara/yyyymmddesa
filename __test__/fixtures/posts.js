'use strict';

export default class PostFixtures {
  constructor(rootCategory, name) {
    this.rootCategory = rootCategory;
    this.name = name;
  }

  generate(articleId, month, day) {
    return {
      number: articleId,
      full_name: this.fullName(month, day),
    };
  }

  fullName(month, day) {
    const paddingMonthNum = `0${month}`.slice(-2);
    return `${this.rootCategory}/2018/${paddingMonthNum}/${day}/${this.name}`;
  }
}
