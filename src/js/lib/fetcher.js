'use strict';

import moment from 'moment';

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

    let posts = (await this.getPostsFromCache(cacheKey)) || [];
    this.logger.log(`  [CACHE] Get ${posts.length} posts from Cache`);

    if (!Scope.isSatisfied(posts, id)) {
      const q = this.query(root, date, name);
      posts = await this.esa.fetchPosts(this.teamName, q);
      this.logger.log(`  [API] Fetched ${posts.length} posts`);
      this.logger.log('  [API] Fetch query is ', q.q);
    }

    await this.setPostsInCache(cacheKey, posts);
    this.logger.log(
      `[INFO] prev/next posts are detected for the post: ${id}. Exit`,
    );
    return { posts, id };
  }

  async getPostsFromCache(keyElements) {
    const cacheKey = {
      teamName: keyElements.teamName,
      root: keyElements.root,
      name: keyElements.name,
    };
    return await Store.getCache(cacheKey);
  }

  async setPostsInCache(keyElements, posts) {
    const cacheKey = {
      teamName: keyElements.teamName,
      root: keyElements.root,
      name: keyElements.name,
    };

    await Store.setCache(cacheKey, posts).catch((error) => {
      console.error(error);
    });
  }

  query(root, date, name) {
    let queries = [];

    for (let i = -2; i < 3; i++) {
      const targetDate = new moment(date, 'YYYY/MM/DD')
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
