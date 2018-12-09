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
    let initializedCache = {};
    initializedCache[key] = null;

    return new Promise((resolve, _reject) => {
      chrome.storage.local.get(initializedCache, function(cache) {
        resolve(JSON.parse(cache[key]));
      });
    });
  }

  static setCache(obj, posts) {
    const key = this.key(obj);
    const postsCache = posts.map((post) => {
      let { number, full_name, url } = post;
      return { number, full_name, url };
    });
    let cache = {};
    cache[key] = JSON.stringify(postsCache);

    return new Promise((resolve, reject) => {
      chrome.storage.local.set(cache, function() {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        resolve();
      });
    });
  }

  static key(obj) {
    let { teamName, root, name } = obj;
    return `cache-${teamName}-${root}-${name}`;
  }
}
