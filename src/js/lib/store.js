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
  static getCache(date, root, name) {
    const key = `${date.getFullYear()}${date.getMonth() + 1}-${root}-${name}`;
    console.log("get cache", key);
    let defaultCache = {};
    defaultCache[key] = "[]";

    return new Promise((resolve, _reject) => {
      chrome.storage.local.get({ cache: defaultCache }, function(cache) {
        resolve(JSON.parse(cache["cache"])[key] || []);
      });
    });
  }

  static setCache(date, root, name, posts) {
    const key = `${date.getFullYear()}${date.getMonth() + 1}-${root}-${name}`;
    console.log("set cache", key, posts);
    let cache = {};
    cache[key] = posts;
    let cacheString = JSON.stringify(cache);

    return new Promise((resolve, _reject) => {
      chrome.storage.local.set({ cache: cacheString }, function(cache) {
        resolve(cache);
      });
    });
  }
}
