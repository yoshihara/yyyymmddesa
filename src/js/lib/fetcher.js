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
    let scope;

    this.logger.log(
      `[INFO] Fetch this month posts from cache/API in ${this.teamName} team`,
      root,
      name,
    );

    this.logger.log(`  target date: ${date}`);

    let posts = await this.getCache(this.teamName, root, name);
    this.logger.log(`  [CACHE] Get ${posts.length} posts from Cache`);

    if (!Scope.isSatisfied(posts, id)) {
      const q = this.query(root, date, name);
      posts = await this.esa.getPosts(this.teamName, q);
      this.logger.log(`  [API] Fetched ${posts.length} posts`);
      this.logger.log('  [API] Fetch query is', q.q);
    }

    // TODO: 引数のオブジェクト化
    await this.setCache(this.teamName, root, name, posts);

    scope = new Scope(posts, id);
    this.logger.log(`[INFO] prev/next posts are detected in ${scope}. Exit`);

    return scope;
  }

  async getCache(teamName, root, name) {
    return (await Store.getCache({ teamName, root, name })) || [];
  }

  async setCache(teamName, root, name, posts) {
    await Store.setCache({ teamName, root, name }, posts).catch((error) => {
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
      queries = queries.concat(
        `in:${[root, targetDate.format('Y/MM')].join('/')}/ user:${name}`,
      );
    }

    return {
      q: queries.join(' OR '),
    };
  }
}
