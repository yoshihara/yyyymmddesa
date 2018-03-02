"use strict";

export default class Formatter {
  static formatCategory(date) {
    const month = this.padding(date.getMonth() + 1);
    return `${date.getFullYear()}/${month}`;
  }

  static padding(data) {
    return ("0" + data).slice(-2);
  }
}
