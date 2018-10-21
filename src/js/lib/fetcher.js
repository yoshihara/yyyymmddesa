import Store from './store.js';
import Esa from './esa.js';
import Scope from './scope.js';
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
    this.logger.log(
      `[INFO] Fetch this month posts from cache/API in ${this.teamName} team`,
      root,
      name,
    );

    this.logger.log(`  target date: ${date}`);

    const cacheKey = { teamName: this.teamName, root, name };

    let posts = await this.getPostsFromCache(cacheKey);
    this.logger.log(`  [CACHE] Get ${posts.length} posts from Cache`);

    if (!Scope.isSatisfied(posts, id)) {
      const q = this.query(root, date, name);
      posts = await this.esa.getPosts(this.teamName, q);
      this.logger.log(`  [API] Fetched ${posts.length} posts`);
      this.logger.log('  [API] Fetch query is', q.q);
    }

    await this.setPostsInCache(cacheKey, posts);

    const scope = new Scope(posts, id);
    this.logger.log(`[INFO] prev/next posts are detected in ${scope}. Exit`);

    return scope;
  }

  async getPostsFromCache(key) {
    return (await Store.getCache(key)) || [];
  }

  async setPostsInCache(key, posts) {
    await Store.setCache(key, posts).catch((error) => {
      console.error(error);
    });
  }

  query(root, date, name) {
    let queries = [];

    for (let i = -2; i < 3; i++) {
      const targetDate = date
        .clone()
        .add(i, 'month')
        .startOf('month');

      const category = [
        root.replace(/\/$/, ''),
        targetDate.format('Y/MM'),
      ].join('/');
      queries = queries.concat(`in:${category}/ user:${name}`);
    }

    return {
      q: queries.join(' OR '),
    };
  }
}
