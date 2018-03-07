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
  // TODO: getCache/setCacheの引数のうちposts以外はオブジェクトで渡す
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

  static setCache(date, root, name, posts) {
    const key = `cache-${date.format("YMM")}-${root}-${name}`;
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
