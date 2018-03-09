"use strict";

export default class Store {
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
      chrome.storage.local.set(defaultCache, function(error) {
        if (error) reject(error);
        resolve(error);
      });
    });
  }

  static key(obj) {
    let { date, root, name } = obj;
    return `cache-${date.format("YMM")}-${root}-${name}`;
  }
}
