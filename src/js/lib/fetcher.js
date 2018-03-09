import Store from "./store.js";

export default class Fetcher {
  constructor(esa) {
    this.esa = esa;
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
