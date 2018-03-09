import Store from "./store.js";
import Organizer from "./organizer.js";

export default class Fetcher {
  constructor(esa) {
    this.esa = esa;
  }
  async getRangePosts(date, root, name, id) {
    const organizer = new Organizer(id);

    let [prevMonthPosts, thisMonthPosts, nextMonthPosts] = [[], [], []];
    let prev, index, next;

    // 今月をキャッシュもしくはAPIで取得
    await this.fetchPosts(date, root, name).then(posts => {
      thisMonthPosts = posts;
    });

    [prev, index, next] = organizer.calculateOrders(thisMonthPosts);

    console.log({ index, prev, next });

    // prev, nextが今月の記事から取得できない、かつその月にprev, nextがありそうなときだけ再取得
    // 基本的に月初から書いていけば起きないはずだが、後から抜けていた日報を書いたときなどをフォローするため
    if (
      index == -1 ||
      (prev < 0 && !this.isFirstDate(date)) ||
      (next >= thisMonthPosts.length && !this.isLastDate(date))
    ) {
      await this.fetchPosts(date, root, name, false).then(posts => {
        thisMonthPosts = posts;
        [prev, index, next] = organizer.calculateOrders(thisMonthPosts);
      });
    }

    // 前のものがない場合、先月分を取ってくる
    if (prev < 0) {
      await this.fetchPosts(this.prevMonth(date), root, name).then(posts => {
        prevMonthPosts = posts;
      });
    }

    // 次のものがない場合、来月分を取ってくる
    if (next >= thisMonthPosts.length) {
      await this.fetchPosts(this.nextMonth(date), root, name).then(posts => {
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

  prevMonth(date) {
    return date
      .clone()
      .subtract(1, "month")
      .startOf("month");
  }

  nextMonth(date) {
    return date
      .clone()
      .add(1, "month")
      .startOf("month");
  }

  isFirstDate(date) {
    let firstDate = date.clone().startOf("month");
    return date.isSame(firstDate, "day");
  }

  isLastDate(date) {
    let lastDate = date.clone().endOf("month");
    return date.isSame(lastDate, "day");
  }

  async fetchPosts(date, root, name, useCache = true) {
    console.log({ fetch: [date, root, name] });
    let cache = null;

    if (useCache) {
      cache = await Store.getCache({ date, root, name });
      console.log({ cache });
    }

    if (cache !== null) {
      console.log({ CacheHit: { date, root, name } });
      return cache;
    } else {
      console.log("no cache hit.");
      let q = this.query(root, date, name);
      let posts = JSON.parse(await this.esa.getPosts(q)).posts;

      await Store.setCache({ date, root, name }, posts).catch(error => {
        console.error(chrome.runtime.lastError, error);
      });
      return posts;
    }
  }

  query(root, date, name) {
    return {
      q: `in:${root}/${date.format("Y/MM")}/ title:${name}`
    };
  }
}
