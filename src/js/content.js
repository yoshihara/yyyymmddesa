"use strict";

import moment from "moment";

import Extractor from "./lib/extractor.js";
import Esa from "./lib/esa.js";
import Store from "./lib/store.js";
import Fetcher from "./lib/fetcher.js";
import UI from "./lib/ui.js";

const path = window.location.pathname;
const match = window.location.pathname.match(/^\/posts\/(\d+)$/);

if (match) {
  const ui = new UI();
  const id = match[1];
  const { root, date, name } = Extractor.currentPostInfo();

  if (root && date && name) {
    ui.showLoading();

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

      ui.showLinks(prevPost, nextPost);
    })(date, root, name, id);
  }
}

async function getRangePosts(date, root, name, id) {
  let q;
  const token = await Store.getToken();
  const esa = new Esa(token);
  const fetcher = new Fetcher(esa);

  let thisMonthPosts;
  await fetcher.fetchPosts(date, root, name).then(post => {
    thisMonthPosts = post;
  });

  let index = fetchIndex(thisMonthPosts, id);
  let prev = index - 1;
  let next = index + 1;

  console.log({ index, prev, next });

  // prev, nextが今月の記事から取得できない、かつその月にprev, nextがありそうなときだけ再取得
  // 基本的に月初から書いていけば起きないはずだが、後から抜けていた日報を書いたときなどをフォローするため
  let firstDate = date.clone().startOf("month");
  let lastDate = date.clone().endOf("month");

  if (
    index == -1 ||
    (prev < 0 && !date.isSame(firstDate, "day")) ||
    (next >= thisMonthPosts.length && !date.isSame(lastDate, "day"))
  ) {
    q = fetcher.query(root, date, name);
    // TODO: ここだけgetPosts生なのでfetcherに何かしらAPI追加する
    thisMonthPosts = JSON.parse(await esa.getPosts(q)).posts;
    Store.setCache({ date, root, name }, thisMonthPosts).catch(error => {
      console.error(chrome.runtime.lastError, error);
    });

    index = fetchIndex(thisMonthPosts, id);
    prev = index - 1;
    next = index + 1;
  }

  let prevMonthPosts = [];
  if (prev < 0) {
    let prevMonth = date
      .clone()
      .subtract(1, "month")
      .startOf("month");
    await fetcher.fetchPosts(prevMonth, root, name).then(post => {
      prevMonthPosts = post;
    });
  }

  let nextMonthPosts = [];
  if (next >= thisMonthPosts.length) {
    let nextMonth = date
      .clone()
      .add(1, "month")
      .startOf("month");
    await fetcher.fetchPosts(nextMonth, root, name).then(post => {
      nextMonthPosts = post;
    });
  }

  // 取得した記事を繋いだ状態でindexを取り直す
  const flatten = (accumulator, currentValue) =>
    accumulator.concat(currentValue);
  console.log({ prevMonthPosts, thisMonthPosts, nextMonthPosts });
  let posts = Object.values([
    prevMonthPosts,
    thisMonthPosts,
    nextMonthPosts
  ]).reduce(flatten);
  index = fetchIndex(posts, id);
  prev = index - 1;
  next = index + 1;

  console.log(posts, index);
  return { prevPost: posts[prev], nextPost: posts[next] };
}

function fetchIndex(posts, id) {
  let post = sortPosts(posts).filter(post => {
    if (post.number == id) return post;
  })[0];

  return posts.indexOf(post);
}

function sortPosts(res) {
  return res.sort((post1, post2) => {
    let fullName1 = post1.full_name;
    let fullName2 = post2.full_name;

    if (fullName1 > fullName2) return 1;
    else if (fullName1 < fullName2) return -1;
    else return 0;
  });
}
