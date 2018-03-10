import Store from "./store.js";
import Esa from "./esa.js";
import Organizer from "./organizer.js";
import Today from "./today.js";

export default class Fetcher {
  constructor() {
    Store.getToken().then(token => (this.esa = new Esa(token)));
  }

  async fetchRange(date, root, name, id) {
    const organizer = new Organizer(id);
    const today = new Today(date);

    let range;
    let [prevMonthPosts, thisMonthPosts, nextMonthPosts] = [[], [], []];

    // 今月をキャッシュもしくはAPIで取得
    await this.fetchPosts(date, root, name).then(posts => {
      thisMonthPosts = posts;
      range = organizer.calculateOrders(thisMonthPosts);
    });

    if (range.isValid) return range;

    // rangeが今月の記事だけではinvalidにならない、かつその月に本来ならrangeがとれそう＝月初もしくは月末でもないときだけ再取得
    // 基本的に月初から記事を書いていけば起きないはずだが、後から抜けていた日報を書いたときなどをフォローするため
    // NOTE: キャッシュがない状態で最新の記事を取ってきた場合に2回APIを叩いてしまう
    if (
      (!range.isValidPrevPost && !today.isFirstDate) ||
      (!range.isValidNextPost && !today.isLastDate)
    ) {
      await this.fetchPosts(date, root, name, false).then(posts => {
        thisMonthPosts = posts;
        range = organizer.calculateOrders(thisMonthPosts);
      });
    }

    // 前のものがない場合、先月分を取ってくる
    if (!range.isValidPrevPost) {
      await this.fetchPosts(today.prevMonth, root, name).then(posts => {
        prevMonthPosts = posts;
      });
    }

    // 次のものがない場合、来月分を取ってくる
    if (!range.isValidNextPost) {
      await this.fetchPosts(today.nextMonth, root, name).then(posts => {
        nextMonthPosts = posts;
      });
    }

    // 取得した記事を繋いだ状態でrangeを取り直す
    let posts = [prevMonthPosts, thisMonthPosts, nextMonthPosts];
    let todayPosts = posts.reduce((accumulator, currentValue) => {
      return accumulator.concat(currentValue);
    });

    return organizer.calculateOrders(todayPosts);
  }

  async fetchPosts(date, root, name, useCache = true) {
    let cache = null;

    if (useCache) {
      cache = await Store.getCache({ date, root, name });
    }

    if (cache !== null) return cache;

    let q = this.query(root, date, name);
    let posts = JSON.parse(await this.esa.getPosts(q)).posts;

    await Store.setCache({ date, root, name }, posts).catch(error => {
      console.error(chrome.runtime.lastError, error);
    });

    return posts;
  }

  query(root, date, name) {
    return {
      q: `in:${root}/${date.format("Y/MM")}/ title:${name}`
    };
  }
}
