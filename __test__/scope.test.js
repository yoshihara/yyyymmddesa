'use strict';

import Scope from '../src/js/lib/scope.js';

jest.unmock('../src/js/lib/scope.js');

describe('Scope', () => {
  describe('isSatisfied', () => {
    it('should return false with invalid posts', () => {
      expect(Scope.isSatisfied(null, 1)).toEqual(false);
      expect(Scope.isSatisfied(undefined, 1)).toEqual(false);
    });

    it('should return false with empty posts', () => {
      expect(Scope.isSatisfied([], 1)).toEqual(false);
    });

    it("should return false when post for id isn't exist", () => {
      const posts = [
        { number: 3, full_name: 'tomorrow', body: 'tomorrow post' },
      ];

      expect(Scope.isSatisfied(posts, 2)).toEqual(false);
    });

    it("should return false when prev post isn't exist", () => {
      const posts = [
        { number: 2, full_name: 'today', body: 'today post' },
        { number: 3, full_name: 'tomorrow', body: 'tomorrow post' },
      ];

      expect(Scope.isSatisfied(posts, 2)).toEqual(false);
    });

    it("should return false when next post isn't exist", () => {
      const posts = [
        { number: 1, full_name: 'prev', body: 'prev post' },
        { number: 2, full_name: 'today', body: 'today post' },
      ];

      expect(Scope.isSatisfied(posts, 2)).toEqual(false);
    });

    it('should return true when prev/today/next posts exist', () => {
      const posts = [
        { number: 1, full_name: 'prev', body: 'prev post' },
        { number: 2, full_name: 'today', body: 'today post' },
        { number: 3, full_name: 'tomorrow', body: 'tomorrow post' },
      ];

      expect(Scope.isSatisfied(posts, 2)).toEqual(true);
    });
  });

  describe('constructor', () => {
    it('should set prev/today/next subscripts', () => {
      const todayPostNumber = 200;
      const posts = [
        { number: 100, full_name: '2018/11/22/prev', body: 'prev post' },
        {
          number: 201,
          full_name: '2018/11/25/tomorrow',
          body: 'tomorrow post',
        },
        { number: 200, full_name: '2018/11/24/today', body: 'today post' },
      ];

      const scope = new Scope(posts, todayPostNumber);

      // NOTE: index isn't number but sorted posts subscript
      expect(scope.index).toBe(1);
      expect(scope.prevIndex).toBe(0);
      expect(scope.nextIndex).toBe(2);
    });

    it("shouldn't set prev/today/next subscripts w/o today post", () => {
      const todayPostNumber = 200;
      const posts = [
        { number: 100, full_name: '2018/11/22/prev', body: 'prev post' },
        {
          number: 201,
          full_name: '2018/11/25/tomorrow',
          body: 'tomorrow post',
        },
        { number: 202, full_name: '2018/11/24/future', body: 'future post' },
      ];

      const scope = new Scope(posts, todayPostNumber);

      expect(scope.index).not.toBeDefined();
      expect(scope.prevIndex).not.toBeDefined();
      expect(scope.nextIndex).not.toBeDefined();
    });
  });

  describe('toString', () => {
    const todayPostNumber = 200;
    const posts = [
      { number: 100, full_name: '2018/11/22/prev', body: 'prev post' },
      { number: 200, full_name: '2018/11/24/today', body: 'today post' },
      { number: 201, full_name: '2018/11/25/tomorrow', body: 'tomorrow post' },
    ];

    it('should show indexes and posts length', () => {
      expect(`${new Scope(posts, todayPostNumber)}`).toBe(
        '0<-1->2 (posts.length is 3)',
      );
    });

    it('should show (none) for invalid subscript post', () => {
      expect(`${new Scope(posts.slice(1, 3), todayPostNumber)}`).toBe(
        '(none)<-0->1 (posts.length is 2)',
      );
      expect(`${new Scope(posts.slice(0, 2), todayPostNumber)}`).toBe(
        '0<-1->(none) (posts.length is 2)',
      );
    });
  });
});
