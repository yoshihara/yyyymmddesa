'use strict';

import moment from 'moment';
import Promise from 'bluebird';

import Fetcher from '../src/js/lib/fetcher';

jest.unmock('../src/js/lib/fetcher.js');
jest.unmock('../src/js/lib/today.js');
jest.unmock('../src/js/lib/scope.js');
jest.unmock('../src/js/lib/logger.js');

describe('Fetcher', () => {
  const teamName = 'test-team';
  const thisMonthNum = 10;
  const prevMonthNum = 9;
  const nextMonthNum = 11;
  const rootCategory = 'daily-reports';
  const name = 'nippo-san';
  const articleId = 2;

  const fetcher = new Fetcher(teamName);

  function setPostsMocks(postsArray, otherResponse) {
    postsArray.forEach((posts) => {
      setPostsMock(posts, otherResponse);
    });
  }

  function setPostsMock(posts, otherResponse) {
    const mock = new Promise((resolve, _) => {
      const response = otherResponse || {};
      response.posts = posts;
      resolve(response);
    });

    fetcher.fetchPosts.mockReturnValueOnce(mock);
  }

  function fullName(month, day) {
    const paddingMonthNum = `0${month}`.slice(-2);
    return `${rootCategory}/2018/${paddingMonthNum}/${day}/${name}`;
  }

  function expectScope(expected, actual) {
    expect(actual.prevIndex).toEqual(expected.prevIndex);
    expect(actual.index).toEqual(expected.index);
    expect(actual.nextIndex).toEqual(expected.nextIndex);
    expect(actual.posts).toEqual(expected.posts);
  }

  function expectFetchingPosts(expected) {
    expect(fetcher.fetchPosts.mock.calls.length).toEqual(expected);
  }

  describe('#fetch', () => {
    // NOTE: 基本キャッシュなしの挙動のみチェック、キャッシュありの場合はfetchPostsのテストでカバーする
    beforeEach(async () => {
      await fetcher.init();
    });

    describe('target is the date without any post', () => {
      beforeEach(() => {
        fetcher.fetchPosts = jest.fn();
      });

      it('should return {}', async () => {
        setPostsMocks([[]]);

        const date = new moment(`2018/${thisMonthNum}/05`, 'YYYY/MM/DD');

        const actual = await fetcher.fetch(date, rootCategory, name, articleId);

        const expected = {};

        expectScope(expected, actual);
        expectFetchingPosts(1);
      });
    });

    describe("target date isn't first/last date", () => {
      let date;

      beforeEach(() => {
        fetcher.fetchPosts = jest.fn();
        date = new moment(`2018/${thisMonthNum}/05`, 'YYYY/MM/DD');
      });

      describe("when cache doesn't have enough posts", () => {
        it('should re-fetch posts via API after cache', async () => {
          const targetPost = {
            number: articleId,
            full_name: fullName(thisMonthNum, 5),
          };
          const cachePosts = [[targetPost]];
          setPostsMocks(cachePosts, { isCache: true });

          const posts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 4) },
              targetPost,
              { number: articleId + 1, full_name: fullName(thisMonthNum, 5) },
            ],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: posts[0],
          };

          expectScope(expected, actual);
          expectFetchingPosts(cachePosts.length + posts.length);
        });
      });

      describe('when cache has enough posts', () => {
        it('should fetch posts from cache only', async () => {
          const cachePosts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 4) },
              { number: articleId, full_name: fullName(thisMonthNum, 5) },
              { number: articleId + 1, full_name: fullName(thisMonthNum, 5) },
            ],
          ];
          setPostsMocks(cachePosts, { isCache: true });

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: cachePosts[0],
          };

          expectScope(expected, actual);
          expectFetchingPosts(cachePosts.length);
        });
      });
    });

    describe('prev article is in previous month', () => {
      // NOTE: 月末月初ではない場合は再取得が走るので月初にしている
      const date = new moment(`2018/${thisMonthNum}/01`, 'YYYY/MM/DD');

      beforeEach(() => {
        fetcher.fetchPosts = jest.fn();
      });

      describe("next article doesn't exist", () => {
        it('should return scope with 2 posts by 3 fetching', async () => {
          const posts = [
            [{ number: articleId, full_name: fullName(thisMonthNum, 1) }],
            [{ number: articleId - 1, full_name: fullName(prevMonthNum, 1) }],
            [],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: [posts[1][0], posts[0][0]],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });

      describe('next article is in this month', () => {
        it('should return scope with 3 posts by 2 fetching', async () => {
          const posts = [
            [
              { number: articleId, full_name: fullName(thisMonthNum, 1) },
              { number: articleId + 1, full_name: fullName(thisMonthNum, 2) },
            ],
            [{ number: articleId - 1, full_name: fullName(prevMonthNum, 1) }],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: [posts[1][0], posts[0][0], posts[0][1]],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });

      describe('next article is in next month', () => {
        it('should return scope with 3 posts by 3 fetching', async () => {
          const posts = [
            [{ number: articleId, full_name: fullName(thisMonthNum, 1) }],
            [{ number: articleId - 1, full_name: fullName(prevMonthNum, 1) }],
            [{ number: articleId + 1, full_name: fullName(nextMonthNum, 1) }],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: [posts[1][0], posts[0][0], posts[2][0]],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });
    });

    describe('prev article is in this month', () => {
      // NOTE: 月末月初ではない場合は再取得が走るので月初にしている
      const date = new moment(`2018/${thisMonthNum}/01`, 'YYYY/MM/DD');

      beforeEach(() => {
        fetcher.fetchPosts = jest.fn();
      });

      describe("next article doesn't exist", () => {
        it('should return scope with 2 posts by 3 fetching', async () => {
          const posts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 1) },
              { number: articleId, full_name: fullName(thisMonthNum, 2) },
            ],
            [],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: posts[0],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });

      describe('next article is in this month', () => {
        it('should return scope with 3 posts by 1 fetching', async () => {
          const posts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 1) },
              { number: articleId, full_name: fullName(thisMonthNum, 2) },
              { number: articleId + 1, full_name: fullName(thisMonthNum, 3) },
            ],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: posts[0],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });

      describe('next article is in next month', () => {
        it('should return scope with 3 posts by 3 fetching', async () => {
          const posts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 1) },
              { number: articleId, full_name: fullName(thisMonthNum, 2) },
            ],
            [{ number: articleId + 1, full_name: fullName(nextMonthNum, 1) }],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: [posts[0][0], posts[0][1], posts[1][0]],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });

      describe("next article doesn't exist", () => {
        it('should return scope with 2 posts by 2 fetching', async () => {
          const posts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 1) },
              { number: articleId, full_name: fullName(thisMonthNum, 2) },
            ],
            [],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: posts[0],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });

      describe('next article is in this month', () => {
        it('should return scope with 3 posts by 1 fetching', async () => {
          const posts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 1) },
              { number: articleId, full_name: fullName(thisMonthNum, 2) },
              { number: articleId + 1, full_name: fullName(thisMonthNum, 3) },
            ],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: posts[0],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });

      describe('next article is in next month', () => {
        it('should return scope with 3 posts by 3 fetching', async () => {
          const posts = [
            [
              { number: articleId - 1, full_name: fullName(thisMonthNum, 1) },
              { number: articleId, full_name: fullName(thisMonthNum, 2) },
            ],
            [{ number: articleId + 1, full_name: fullName(nextMonthNum, 1) }],
          ];
          setPostsMocks(posts);

          const actual = await fetcher.fetch(
            date,
            rootCategory,
            name,
            articleId,
          );

          const expected = {
            prevIndex: 0,
            index: 1,
            nextIndex: 2,
            posts: [posts[0][0], posts[0][1], posts[1][0]],
          };

          expectScope(expected, actual);
          expectFetchingPosts(posts.length);
        });
      });
    });
  });
});
