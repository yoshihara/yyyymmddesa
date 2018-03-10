"use strict";

import Store from "./store.js";

export default class Logger {
  constructor() {
    Store.getDebugflag().then(flag => (this.isDebug = flag));
  }

  log() {
    if (this.isDebug) {
      let args = Array.prototype.slice.call(arguments);
      let str = args.join(" ");
      console.log(str);
    }
  }
}
