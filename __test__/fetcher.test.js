'use strict';

import moment from 'moment';
import Promise from 'bluebird';

import Fetcher from '../src/js/lib/fetcher';

jest.unmock('../src/js/lib/fetcher.js');
jest.unmock('../src/js/lib/scope.js');
jest.unmock('../src/js/lib/logger.js');

import PostFixtures from './fixtures/posts';
jest.unmock('./fixtures/posts');

describe('Fetcher', () => {
  const teamName = 'test-team';
  const thisMonthNum = 10;
  const prevMonthNum = 9;
  const nextMonthNum = 11;
  const rootCategory = 'daily-reports';
  const name = 'nippo-san';
  const articleId = 2;

  const fetcher = new Fetcher(teamName);
  const postFixtures = new PostFixtures(rootCategory, name);

  function defineFetchingPostsMock(posts) {
    const mock = new Promise((resolve, _) => {
      resolve(posts);
    });

    fetcher.esa.fetchPosts = jest.fn();
    fetcher.esa.fetchPosts.mockReturnValueOnce(mock);
  }

  function defineGettingCacheMock(posts) {
    fetcher.getPostsFromCache = jest.fn((keyElements) => {
      expect(keyElements.teamName).toBeDefined();
      expect(keyElements.root).toBeDefined();
      expect(keyElements.name).toBeDefined();

      return new Promise((resolve, _) => resolve(posts));
    });
  }

  async function actualPosts(date) {
    return await fetcher.fetch(date, rootCategory, name, articleId);
  }

  function assertScope(expected, actual) {
    expect(actual.prevIndex).toEqual(expected.prevIndex);
    expect(actual.index).toEqual(expected.index);
    expect(actual.nextIndex).toEqual(expected.nextIndex);
    expect(actual.posts).toEqual(expected.posts);
  }

  function assertFetchAPITimes(expected) {
    expect(fetcher.esa.fetchPosts.mock.calls.length).toEqual(expected);
  }

  describe('#fetch', () => {
    beforeEach(async () => {
      await fetcher.init();
      fetcher.setPostsInCache = jest.fn((keyElements, _posts) => {
        expect(keyElements.teamName).toBeDefined();
        expect(keyElements.root).toBeDefined();
        expect(keyElements.name).toBeDefined();
      });
    });

    describe('target is the date without any post', () => {
      it('should return empty scope', async () => {
        defineGettingCacheMock([]);
        defineFetchingPostsMock([]);

        const date = new moment(`2018/${thisMonthNum}/05`, 'YYYY/MM/DD');

        const expected = {
          prevIndex: undefined,
          index: undefined,
          nextIndex: undefined,
          posts: [],
        };

        assertScope(expected, await actualPosts(date));
        assertFetchAPITimes(1);
      });
    });

    describe('target is the date with post', () => {
      const date = new moment(`2018/${thisMonthNum}/01`, 'YYYY/MM/DD');

      const posts = [
        postFixtures.generate(articleId - 1, prevMonthNum, 1),
        postFixtures.generate(articleId, thisMonthNum, 1),
        postFixtures.generate(articleId + 1, nextMonthNum, 1),
      ];

      const expected = {
        prevIndex: 0,
        index: 1,
        nextIndex: 2,
        posts: posts,
      };

      describe('when satisfied posts exist in cache', () => {
        beforeEach(() => {
          defineGettingCacheMock(posts);
        });

        it('should return scope with posts using Cache', async () => {
          assertScope(expected, await actualPosts(date));
          assertFetchAPITimes(0);
        });
      });

      describe('when no satisfied posts exist in cache', () => {
        beforeEach(() => {
          defineFetchingPostsMock(posts);
        });

        describe("when prev post doesn't exist in cache", () => {
          beforeEach(() => {
            defineGettingCacheMock([posts[1], posts[2]]);
          });

          it('should return scope with posts using API after cache fetching', async () => {
            assertScope(expected, await actualPosts(date));
            assertFetchAPITimes(1);
          });
        });

        describe("when next post doesn't exist in cache", () => {
          beforeEach(() => {
            defineGettingCacheMock([posts[0], posts[1]]);
          });

          it('should return scope with posts using API after cache fetching', async () => {
            assertScope(expected, await actualPosts(date));
            assertFetchAPITimes(1);
          });
        });

        describe("when target post doesn't exist in cache", () => {
          beforeEach(() => {
            defineGettingCacheMock([posts[0]]);
          });

          it('should return scope with posts using API after cache fetching', async () => {
            assertScope(expected, await actualPosts(date));
            assertFetchAPITimes(1);
          });
        });

        describe("when any post doesn't exist in cache", () => {
          beforeEach(() => {
            defineGettingCacheMock([]);
          });

          it('should return scope with posts using API', async () => {
            assertScope(expected, await actualPosts(date));
            assertFetchAPITimes(1);
          });
        });
      });
    });
  });
});
