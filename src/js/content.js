"use strict";

import Extractor from "./lib/extractor.js";
import Esa from "./lib/esa.js";
import Formatter from "./lib/formatter.js";

const path = window.location.pathname;
const match = window.location.pathname.match(/^\/posts\/(\d+)$/);

if (match) {
  const id = match[1];
  const category = Extractor.category();
  const rootAndDate = category.match(/^(.+)\/(\d\d\d\d)\/(\d\d)(\/\d\d)?$/);

  if (rootAndDate) {
    const root = rootAndDate[1];
    const year = rootAndDate[2];
    const month = parseInt(rootAndDate[3]);
    const name = Extractor.name();

    const range = [
      new Date(year, month - 2),
      new Date(year, month - 1),
      new Date(year, month)
    ];

    // TODO: 今月だけ渡す
    (async (range, root, name, id) => {
      let posts = await getRangePosts(range, root, name);
      let nowPost = posts.filter(post => {
        if (post.number == id) return post;
      })[0];
      let index = posts.indexOf(nowPost);
      let prev = index - 1;
      let next = index + 1;

      console.log(posts)
      // それぞれのconsole.logしてるpostからリンク作って何処かに置く
      if (prev >= 0) {
        console.log(posts[prev]);
      }
      if (next < posts.length) {
        console.log(posts[next]);
      }
    })(range, root, name, id);
  }
}

function getRangePosts(range, root, name) {
  return new Promise((resolve, _reject) => {
    (async (range, root, name) => {
      let monthPosts = {};
      const token = await getToken();
      const esa = new Esa(token);

      for (let i = 0; i < range.length; i++) {
        let date = range[i];
        // 今月の記事のキャッシュがあればそれを取得
        // ない場合は取ってくる
        // 今月の記事の中での自分の位置を確認
        // 今月の記事が自分より後ろがあればnextは取得しなくて良い
        // 後ろがない場合は今月と次の月を取ってくる
        // 今月の記事が自分より前があればprevは取得しなくて良い
        // 前がない場合は今月と前の月を取ってくる

        let q = query(root, date, name);

        // TODO: このへんで取得した記事のキャッシュが必要 {yyyymm => posts}
        let parsedPosts = JSON.parse(await esa.getPosts(q)).posts;
        monthPosts[date] = parsedPosts;
      }

      const flatten = (accumulator, currentValue) => accumulator.concat(currentValue);
      const posts = Object.values(monthPosts).reduce(flatten);
      return sortPosts(posts);
    })(range, root, name)
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

function sortPosts(res) {
  return res.sort((a, b) => {
    let ac = a.category;
    let bc = b.category;

    if (ac > bc) return 1;
    else if (ac < bc) return -1;
    else return 0;
  });
}
