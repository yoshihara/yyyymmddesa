"use strict";

import $ from "jquery";
import Extractor from "./lib/extractor.js";
import Esa from "./lib/esa.js";
import Formatter from "./lib/formatter.js";

const path = window.location.pathname;
const match = window.location.pathname.match(/^\/posts\/(\d+)$/);

if (match) {
  const id = match[1];
  const category = Extractor.category();
  const rootAndDate = category.match(/^(.+)\/(\d\d\d\d)\/(\d\d)\/\d\d$/);

  if (rootAndDate) {
    const root = rootAndDate[1];
    const year = rootAndDate[2];
    const month = parseInt(rootAndDate[3]);
    const name = Extractor.name();

    const date = new Date(year, month - 1);

    (async (date, root, name, id) => {
      let { prevPost, nextPost } = await getRangePosts(date, root, name, id);

      let target = $(`<div class='row yyyymmddesa-appended'></div>`);

      if (prevPost) {
        target.append(
          `<a href='${prevPost.url}' style='float:left;'>${
            prevPost.full_name
          }</a>`
        );
      }
      if (nextPost) {
        target.append(
          `<a href='${nextPost.url}' style='float:right;'>${
            nextPost.full_name
          }</a>`
        );
      }
      $(".post-prev-next").append(target);
    })(date, root, name, id);
  }
}

function getRangePosts(date, root, name, id) {
  return new Promise((resolve, _reject) => {
    (async (date, root, name, id) => {
      let monthPosts = {};
      const token = await getToken();
      const esa = new Esa(token);

      // TODO: この辺からの、dateを引数にキャッシュを取ってきて、無かったらesaからfetchするのをくくりだして、↓でやってるprevやnextのfetchを置き換える
      let q;
      let thisMonthPosts;
      let cache = await getCache(date, root, name);

      if (cache !== []) {
        thisMonthPosts = cache;
      } else {
        q = query(root, date, name);
        thisMonthPosts = JSON.parse(await esa.getPosts(q)).posts;
        setCache(date, root, name, thisMonthPosts);
      }
      thisMonthPosts = sortPosts(thisMonthPosts);

      let index = fetchIndex(thisMonthPosts, id);
      let prev = index - 1;
      let next = index + 1;

      // 再取得
      if (index == -1 || prev < 0 || next >= thisMonthPosts.length) {
        q = query(root, date, name);
        thisMonthPosts = sortPosts(JSON.parse(await esa.getPosts(q)).posts);
      }

      let prevMonthPosts = [];
      if (prev < 0) {
        let prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
        let q = query(root, prevMonth, name);
        prevMonthPosts = sortPosts(JSON.parse(await esa.getPosts(q)).posts);
        setCache(prevMonth, root, name, prevMonthPosts);
      }

      let nextMonthPosts = [];
      if (next >= thisMonthPosts.length) {
        let nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
        let q = query(root, nextMonth, name);
        nextMonthPosts = sortPosts(JSON.parse(await esa.getPosts(q)).posts);
        setCache(nextMonth, root, name, nextMonthPosts);
      }

      // 取得した記事を繋いだ状態でindexを取り直す
      const flatten = (accumulator, currentValue) =>
        accumulator.concat(currentValue);
      console.log([prevMonthPosts, thisMonthPosts, nextMonthPosts]);
      let posts = Object.values([
        prevMonthPosts,
        thisMonthPosts,
        nextMonthPosts
      ]).reduce(flatten);
      posts = sortPosts(posts);
      index = fetchIndex(posts, id);
      prev = index - 1;
      next = index + 1;

      console.log(posts, index);
      return { prevPost: posts[prev], nextPost: posts[next] };
    })(date, root, name, id)
      .then(posts => {
        resolve(posts);
      })
      .catch(err => {
        console.log("Error occured:");
        console.error(err);
      });
  });
}

function query(root, date, name) {
  return {
    q: `in:${root}/${Formatter.formatCategory(date)}/ title:${name}`
  };
}

function getToken() {
  return new Promise((resolve, _reject) => {
    chrome.storage.local.get({ token: null }, function(config) {
      resolve(config.token);
    });
  });
}

// TODO: getCache/setCacheの引数のうちpostsは{number, full_name, url}だけにする
// TODO: getCache/setCacheの引数のうちposts以外はオブジェクトで渡す
function getCache(date, root, name) {
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

function setCache(date, root, name, posts) {
  const key = `${date.getFullYear()}${date.getMonth() + 1}-${root}-${name}`;
  console.log("set cache", key, posts);
  let cache = {};
  cache[key] = posts;

  return new Promise((resolve, _reject) => {
    chrome.storage.local.set({ cache: JSON.stringify(cache) }, function(cache) {
      resolve(cache);
    });
  });
}

function sortPosts(res) {
  return res.sort((a, b) => {
    let ac = a.category;
    let bc = b.category;

    if (ac > bc) return 1;
    else if (ac < bc) return -1;
    else return 0;
  });
}

function fetchIndex(posts, id) {
  let post = posts.filter(post => {
    if (post.number == id) return post;
  })[0];

  return posts.indexOf(post);
}
