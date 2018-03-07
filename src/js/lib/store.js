"use strict";

export default class Store {
  static getToken() {
    return new Promise((resolve, _reject) => {
      chrome.storage.local.get({ token: null }, function(config) {
        resolve(config.token);
      });
    });
  }

  // TODO: getCache/setCacheの引数のうちpostsは{number, full_name, url}だけにする
  static getCache(obj) {
    const key = this.key(obj);
    console.log("get cache", key);
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
    console.log("set cache", key, posts);
    let defaultCache = {};
    defaultCache[key] = JSON.stringify(posts);

    return new Promise((resolve, _reject) => {
      chrome.storage.local.set(defaultCache, function(error) {
        if (error) resolve(error);
        resolve(error);
      });
    });
  }

  static key(obj) {
    let { date, root, name } = obj;
    return `cache-${date.format("YMM")}-${root}-${name}`;
  }
}
