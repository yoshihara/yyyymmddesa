import Store from "./store.js";
import Formatter from "./formatter.js";

export default class Fetcher {
  constructor(esa) {
    this.esa = esa;
  }

  async fetchPosts(date, root, name) {
    console.log({ fetch: [date, root, name] });
    let cache = await Store.getCache(date, root, name);
    console.log({ cache });
    if (cache.length > 0) {
      console.log({ CacheHit: {date, root, name} });
      return cache;
    } else {
      let q;
      let posts;

      q = this.query(root, date, name);
      posts = JSON.parse(await this.esa.getPosts(q)).posts;
      await Store.setCache(date, root, name, posts);
      return posts;
    }
  }

  query(root, date, name) {
    return {
      q: `in:${root}/${Formatter.formatCategory(date)}/ title:${name}`
    };
  }
}