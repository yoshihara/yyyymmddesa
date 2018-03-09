import Store from "./store.js";
import Esa from "./esa.js";
import Organizer from "./organizer.js";

export default class Fetcher {
  constructor() {
    Store.getToken().then(token => (this.esa = new Esa(token)));
  }

  async fetchRange(date, root, name, id) {
    const organizer = new Organizer(id);
    let range;

    let [prevMonthPosts, thisMonthPosts, nextMonthPosts] = [[], [], []];
    let prev, index, next;

    // 今月をキャッシュもしくはAPIで取得
    await this.fetchPosts(date, root, name).then(posts => {
      thisMonthPosts = posts;
      range = organizer.calculateOrders(thisMonthPosts);
    });

    console.log(range);
    if (range.isValid) return range;

    // prev, nextが今月の記事から取得できない、かつその月にprev, nextがありそうなときだけ再取得
    // 基本的に月初から書いていけば起きないはずだが、後から抜けていた日報を書いたときなどをフォローするため
    // NOTE: キャッシュがない状態で最新の記事を取ってきた場合に2回APIを叩いてしまう
    if (
      (!range.isValidPrevPost && !this.isFirstDate(date)) ||
      (!range.isValidNextPost && !this.isLastDate(date))
    ) {
      await this.fetchPosts(date, root, name, false).then(posts => {
        thisMonthPosts = posts;
        range = organizer.calculateOrders(thisMonthPosts);
      });
    }

    // 前のものがない場合、先月分を取ってくる
    if (!range.isValidPrevPost) {
      await this.fetchPosts(this.prevMonth(date), root, name).then(posts => {
        prevMonthPosts = posts;
      });
    }

    // 次のものがない場合、来月分を取ってくる
    if (!range.isValidNextPost) {
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

    range = organizer.calculateOrders(posts);

    console.log(posts, range);
    return range;
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
