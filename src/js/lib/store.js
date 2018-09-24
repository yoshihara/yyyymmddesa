'use strict';

import Promise from 'bluebird';

export default class Store {
  static getDebugflag() {
    return new Promise((resolve, _reject) => {
      chrome.storage.local.get({ isDebug: false }, function(flag) {
        resolve(flag.isDebug);
      });
    });
  }

  static getToken() {
    return new Promise((resolve, _reject) => {
      chrome.storage.local.get({ token: null }, function(config) {
        resolve(config.token);
      });
    });
  }

  static getCache(obj) {
    const key = this.key(obj);
    let cache = {};
    cache[key] = null;

    return new Promise((resolve, _reject) => {
      chrome.storage.local.get(cache, function(cache) {
        resolve(JSON.parse(cache[key]));
      });
    });
  }

  static setCache(obj, posts) {
    const key = this.key(obj);
    const cache = posts.map(post => {
      let { number, full_name, url } = post;
      return { number, full_name, url };
    });
    let defaultCache = {};
    defaultCache[key] = JSON.stringify(cache);

    return new Promise((resolve, reject) => {
      chrome.storage.local.set(defaultCache, function() {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }

  static key(obj) {
    let { date, root, name } = obj;
    return `cache-${date.format('YMM')}-${root}-${name}`;
  }
}
