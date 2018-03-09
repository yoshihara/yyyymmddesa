"use strict";

import moment from "moment";

import Extractor from "./lib/extractor.js";
import Esa from "./lib/esa.js";
import Store from "./lib/store.js";
import Fetcher from "./lib/fetcher.js";
import Organizer from "./lib/organizer.js";
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
  const token = await Store.getToken();
  const esa = new Esa(token);
  const fetcher = new Fetcher(esa);
  const organizer = new Organizer(id);

  // 今月をキャッシュもしくはAPIで取得
  let thisMonthPosts;
  await fetcher.fetchPosts(date, root, name).then(posts => {
    thisMonthPosts = posts;
  });

  let prev, index, next;
  [prev, index, next] = organizer.calculateOrders(thisMonthPosts);

  console.log({ index, prev, next });

  // prev, nextが今月の記事から取得できない、かつその月にprev, nextがありそうなときだけ再取得
  // 基本的に月初から書いていけば起きないはずだが、後から抜けていた日報を書いたときなどをフォローするため
  if (
    index == -1 ||
    (prev < 0 && !isFirstDate(date)) ||
    (next >= thisMonthPosts.length && !isLastDate(date))
  ) {
    await fetcher.fetchPosts(date, root, name, false).then(posts => {
      thisMonthPosts = posts;
      [prev, index, next] = organizer.calculateOrders(thisMonthPosts);
    });
  }

  // 前のものがない場合、先月分を取ってくる
  let prevMonthPosts = [];
  if (prev < 0) {
    await fetcher.fetchPosts(prevMonth(date), root, name).then(posts => {
      prevMonthPosts = posts;
    });
  }

  // 次のものがない場合、来月分を取ってくる
  let nextMonthPosts = [];
  if (next >= thisMonthPosts.length) {
    await fetcher.fetchPosts(nextMonth(date), root, name).then(posts => {
      nextMonthPosts = posts;
    });
  }

  // 取得した記事を繋いだ状態でindexを取り直す
  console.log({ prevMonthPosts, thisMonthPosts, nextMonthPosts });
  let posts = organizer.flatten([
    prevMonthPosts,
    thisMonthPosts,
    nextMonthPosts
  ]);

  [prev, index, next] = organizer.calculateOrders(posts);

  console.log(posts, index);
  return { prevPost: posts[prev], nextPost: posts[next] };
}

function prevMonth(date) {
  return date
    .clone()
    .subtract(1, "month")
    .startOf("month");
}

function nextMonth(date) {
  return date
    .clone()
    .add(1, "month")
    .startOf("month");
}

function isFirstDate(date) {
  let firstDate = date.clone().startOf("month");
  return date.isSame(firstDate, "day");
}

function isLastDate(date) {
  let lastDate = date.clone().endOf("month");
  return date.isSame(lastDate, "day");
}
