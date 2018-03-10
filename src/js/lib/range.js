"use strict";

export default class Range {
  constructor(obj) {
    this.prevIndex = obj.prevIndex;
    this.index = obj.index;
    this.nextIndex = obj.nextIndex;
    this.posts = obj.posts;
  }

  get prevPost() {
    return this.posts[this.prevIndex];
  }

  get nextPost() {
    return this.posts[this.nextIndex];
  }

  get isValid() {
    return (
      this.isValidPrevPost &&
      this.isValidIndex(this.index) &&
      this.isValidNextPost
    );
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
