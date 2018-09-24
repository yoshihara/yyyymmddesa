'use strict';

export default class Range {
  constructor(rawPosts, id) {
    id = parseInt(id);

    let posts = rawPosts.sort((post1, post2) => {
      let fullName1 = post1.full_name;
      let fullName2 = post2.full_name;

      if (fullName1 > fullName2) return 1;
      else if (fullName1 < fullName2) return -1;
      else return 0;
    });

    let todayPost = posts.filter((post) => {
      if (post.number == id) return post;
    })[0];

    if (!todayPost) {
      throw Error(`Invalid posts for post id: ${id}`);
    }

    this.index = posts.indexOf(todayPost);
    this.prevIndex = this.index - 1;
    this.nextIndex = this.index + 1;
    this.posts = posts;
  }

  get prevPost() {
    return this.posts[this.prevIndex];
  }

  get nextPost() {
    return this.posts[this.nextIndex];
  }

  get isValidPrevPost() {
    return this.isValidIndex(this.prevIndex);
  }

  get isValidNextPost() {
    return this.isValidIndex(this.nextIndex);
  }

  isValidIndex(i) {
    return 0 <= i && i < this.posts.length;
  }
}

Range.prototype.toString = function() {
  return `${this.prevIndex}<-${this.index}->${this.nextIndex}(in ${
    this.posts.length
  } posts)`;
};
