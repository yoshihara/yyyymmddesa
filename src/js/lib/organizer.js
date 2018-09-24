'use strict';

import Range from './range.js';

export default class Organizer {
  constructor(id) {
    this.id = parseInt(id);
  }

  calculateOrders(posts) {
    let post = this.sortPosts(posts).filter((post) => {
      if (post.number == this.id) return post;
    })[0];

    const index = posts.indexOf(post);
    const [prev, next] = [index - 1, index + 1];

    return new Range({ prevIndex: prev, index, nextIndex: next, posts });
  }

  sortPosts(res) {
    return res.sort((post1, post2) => {
      let fullName1 = post1.full_name;
      let fullName2 = post2.full_name;

      if (fullName1 > fullName2) return 1;
      else if (fullName1 < fullName2) return -1;
      else return 0;
    });
  }
}
