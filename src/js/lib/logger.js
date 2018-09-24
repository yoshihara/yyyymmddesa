'use strict';

export default class Logger {
  constructor(isDebug) {
    this.isDebug = isDebug;
  }

  log() {
    if (this.isDebug) {
      let args = Array.prototype.slice.call(arguments);
      let str = args.join(' ');
      console.log(str);
    }
  }
}
