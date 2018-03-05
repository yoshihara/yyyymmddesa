"use strict";

import $ from "jquery";
import Extractor from "./lib/extractor.js";
import Esa from "./lib/esa.js";
import Formatter from "./lib/formatter.js";
import Store from "./lib/store.js";

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

    let prevPost, nextPost;
    (async (date, root, name, id) => {
      await getRangePosts(date, root, name, id)
        .then(posts => {
          prevPost = posts.prevPost;
          nextPost = posts.nextPost;
        })
        .catch(err => {
          console.log("Error occured in fetch:");
          console.error(err);
          return;
        });

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

async function getRangePosts(date, root, name, id) {
  let q;
  let monthPosts = {};
  const token = await Store.getToken();
  const esa = new Esa(token);

  let thisMonthPosts;
  await fetchPosts(token, date, root, name).then(post => {
    thisMonthPosts = post;
  });

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
    Store.setCache(prevMonth, root, name, prevMonthPosts);
  }

  let nextMonthPosts = [];
  if (next >= thisMonthPosts.length) {
    let nextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
    let q = query(root, nextMonth, name);
    nextMonthPosts = sortPosts(JSON.parse(await esa.getPosts(q)).posts);
    Store.setCache(nextMonth, root, name, nextMonthPosts);
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
}

// TODO: esaに移動してtokenわたすのをやめる
async function fetchPosts(token, date, root, name) {
  const esa = new Esa(token);

  let cache = await Store.getCache(date, root, name);
  if (cache.length > 0) {
    return cache;
  } else {
    let q;
    let posts;

    q = query(root, date, name);
    posts = JSON.parse(await esa.getPosts(q)).posts;
    await Store.setCache(date, root, name, posts);
    return sortPosts(posts);
  }
}
function query(root, date, name) {
  return {
    q: `in:${root}/${Formatter.formatCategory(date)}/ title:${name}`
  };
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
