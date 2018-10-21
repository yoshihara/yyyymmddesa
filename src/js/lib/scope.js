'use strict';

export default class Scope {
  static isSatisfied(posts, id) {
    if (!posts) return false;
    if (posts.length == 0) return false;

    let intId = parseInt(id);
    let todayPost = posts.filter((post) => {
      return parseInt(post.number) == intId ? post : null;
    })[0];

    if (!todayPost) return false;
    const todayPostIndex = posts.indexOf(todayPost);

    if (!posts[todayPostIndex - 1]) return false;
    if (!posts[todayPostIndex + 1]) return false;
    return true;
  }

  constructor(rawPosts, id) {
    let posts = rawPosts.sort((post1, post2) => {
      let fullName1 = post1.full_name;
      let fullName2 = post2.full_name;

      if (fullName1 > fullName2) return 1;
      else if (fullName1 < fullName2) return -1;
      else return 0;
    });

    this.posts = posts;

    posts.forEach((post) => {
      if (post.number == id) {
        this.index = posts.indexOf(post);
        this.prevIndex = this.index - 1;
        this.nextIndex = this.index + 1;
      }
    });
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

  toString() {
    const formatPrevIndex = this.prevIndex > -1 ? this.prevIndex : '(none)';
    const formatNextIndex =
      this.nextIndex < this.posts.length ? this.nextIndex : '(none)';

    return `${formatPrevIndex}<-${
      this.index
    }->${formatNextIndex} (posts.length is ${this.posts.length})`;
  }
}
