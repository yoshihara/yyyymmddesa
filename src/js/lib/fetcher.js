import Store from './store.js';
import Esa from './esa.js';
import Scope from './scope.js';
import Today from './today.js';
import Logger from './logger.js';

export default class Fetcher {
  constructor(teamName) {
    this.teamName = teamName;
  }

  async init() {
    const token = await Store.getToken();
    this.esa = new Esa(token);

    const flag = await Store.getDebugflag();
    this.logger = new Logger(flag);
  }

  async fetch(date, root, name, id) {
    const today = new Today(date);

    let scope;
    let isCachedThisMonth = false;
    let [prevMonthPosts, thisMonthPosts, nextMonthPosts] = [[], [], []];

    // 今月をキャッシュもしくはAPIで取得
    this.logger.log(
      `[INFO] Fetch this month posts from cache/API in ${this.teamName} team`,
      date,
      root,
      name,
    );
    await this.fetchPosts(date, root, name, { cacheIgnoreLength: 0 }).then(
      (response) => {
        isCachedThisMonth = response.isCache;
        thisMonthPosts = response.posts;
      },
    );

    if (!thisMonthPosts.length) {
      this.logger.log(
        '[WARN] Fetched this month posts in this team is 0. Exit',
      );
      return {};
    } else {
      scope = new Scope(thisMonthPosts, id);
    }

    if (this.isValidPrevPost && this.isValidNextPost) {
      this.logger.log(
        '[INFO] prev/next posts are detected in this month. Exit',
      );
      return scope;
    }

    // scopeがキャッシュから取ってきた今月の記事だけではvalidにならない、
    // かつその月に本来ならscopeがとれそう＝月初もしくは月末でもないときだけ再取得
    // 基本的に月初から記事を書いていけば起きないはずだが、後から抜けていた日報を書いたときなどをフォローするため
    if (
      isCachedThisMonth &&
      ((!scope.isValidPrevPost && !today.isFirstDate) ||
        (!scope.isValidNextPost && !today.isLastDate))
    ) {
      this.logger.log(
        "[INFO] prev/next posts aren't detected in this month, so re-fetch posts via API",
      );
      await this.fetchPosts(date, root, name, { useCache: false }).then(
        (response) => {
          thisMonthPosts = response.posts;
          scope = new Scope(thisMonthPosts, id);
        },
      );
    }

    // 前のものがない場合、先月分を取ってくる
    if (!scope.isValidPrevPost) {
      this.logger.log(
        '[INFO] Invalid prev post in this month',
        scope,
        today.prevMonth.toString(),
      );
      await this.fetchPosts(today.prevMonth, root, name).then((response) => {
        prevMonthPosts = response.posts;
      });
    }

    // 次のものがない場合、来月分を取ってくる
    if (!scope.isValidNextPost) {
      this.logger.log(
        '[INFO] Invalid next post in this month',
        scope,
        today.nextMonth.toString(),
      );
      await this.fetchPosts(today.nextMonth, root, name).then((response) => {
        nextMonthPosts = response.posts;
      });
    }

    // 取得した記事を繋いだ状態でscopeを取り直す
    let posts = prevMonthPosts.concat(thisMonthPosts).concat(nextMonthPosts);
    scope = new Scope(posts, id);
    this.logger.log(`[INFO] prev/next posts are detected in ${scope}. Exit`);

    return scope;
  }

  async fetchPosts(date, root, name, opt = {}) {
    const defaultOptions = { useCache: true, cacheIgnoreLength: null };
    const options = Object.assign(defaultOptions, opt);
    let cache = null;

    if (options.useCache) {
      this.logger.log('  [INFO] Use Cache for', date, root, name);
      cache = await Store.getCache({ date, root, name });
    } else {
      this.logger.log(
        '  [INFO] By option, avoid to use Cache for',
        date,
        root,
        name,
      );
    }

    if (!cache) {
      this.logger.log(
        '  [INFO] Cache length is null, fetch via API',
        date,
        root,
        name,
      );
    } else if (cache.length == options.cacheIgnoreLength) {
      this.logger.log(
        `  [INFO] Cache length is ${cache.length}, fetch via API`,
      );
    } else {
      this.logger.log(`  [INFO] Cache length is ${cache.length}. Return cache`);
      return { posts: cache, isCache: true };
    }

    let q = this.query(root, date, name);
    this.logger.log('  [INFO] Fetch posts from API for', date, root, name);
    this.logger.log('  [INFO] Fetch query is', q.q);

    let posts = JSON.parse(await this.esa.getPosts(this.teamName, q)).posts;

    this.logger.log(`  [INFO] Fetched ${posts.length} posts`);

    await Store.setCache({ date, root, name }, posts).catch((error) => {
      console.error(error);
    });

    return { posts, isCache: false };
  }

  query(root, date, name) {
    return {
      q: `in:${root}/${date.format('Y/MM')}/ user:${name}`,
    };
  }
}
