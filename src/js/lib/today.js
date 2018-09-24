'use strict';

export default class Duration {
  constructor(date) {
    this.date = date;
  }

  get prevMonth() {
    return this.date
      .clone()
      .subtract(1, 'month')
      .startOf('month');
  }

  get nextMonth() {
    return this.date
      .clone()
      .add(1, 'month')
      .startOf('month');
  }

  get isFirstDate() {
    let firstDate = this.date.clone().startOf('month');
    return this.date.isSame(firstDate, 'day');
  }

  get isLastDate() {
    let lastDate = this.date.clone().endOf('month');
    return this.date.isSame(lastDate, 'day');
  }
}
