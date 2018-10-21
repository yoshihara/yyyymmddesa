'use strict';

import moment from 'moment';
import Promise from 'bluebird';

import Fetcher from '../src/js/lib/fetcher';

jest.unmock('../src/js/lib/fetcher.js');
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

  function setPostsMock(posts) {
    const mock = new Promise((resolve, _) => {
      resolve(posts);
    });

    fetcher.esa.getPosts = jest.fn();
    fetcher.esa.getPosts.mockReturnValueOnce(mock);
  }

  function setCacheMock(posts) {
    fetcher.getPostsFromCache = jest.fn(() => {
      return new Promise((resolve, _) => resolve(posts));
    });
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

  function expectFetchWithAPICount(expected) {
    expect(fetcher.esa.getPosts.mock.calls.length).toEqual(expected);
  }

  describe('#fetch', () => {
    beforeEach(async () => {
      await fetcher.init();
      fetcher.setCache = jest.fn();
    });

    describe('target is the date without any post', () => {
      it('should return {}', async () => {
        setCacheMock([]);
        setPostsMock([]);

        const date = new moment(`2018/${thisMonthNum}/05`, 'YYYY/MM/DD');

        const actual = await fetcher.fetch(date, rootCategory, name, articleId);
        const expected = {
          prevIndex: undefined,
          index: undefined,
          nextIndex: undefined,
          posts: [],
        };

        expectScope(expected, actual);
        expectFetchWithAPICount(1);
      });
    });

    describe('target is the date with post', () => {
      const date = new moment(`2018/${thisMonthNum}/01`, 'YYYY/MM/DD');

      describe('when no satisfied posts exist in cache', () => {
        const posts = [
          { number: articleId - 1, full_name: fullName(prevMonthNum, 1) },
          { number: articleId, full_name: fullName(thisMonthNum, 1) },
          { number: articleId + 1, full_name: fullName(nextMonthNum, 1) },
        ];

        it('should return scope with posts using API after cache fetching', async () => {
          setCacheMock([posts[0]]);
          setPostsMock(posts);

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
            posts: posts,
          };

          expectScope(expected, actual);
          expectFetchWithAPICount(1);
        });
      });

      describe('when satisfied posts exist in cache', () => {
        const posts = [
          { number: articleId - 1, full_name: fullName(prevMonthNum, 1) },
          { number: articleId, full_name: fullName(thisMonthNum, 1) },
          { number: articleId + 1, full_name: fullName(nextMonthNum, 1) },
        ];

        it('should return scope with posts using Cache', async () => {
          setCacheMock(posts);

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
            posts: posts,
          };

          expectScope(expected, actual);
          expectFetchWithAPICount(0);
        });

        describe("when satisfied posts don't exist in cache", () => {
          it('should return scope with posts using API', async () => {
            setCacheMock([]);
            setPostsMock(posts);

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
              posts: posts,
            };

            expectScope(expected, actual);
            expectFetchWithAPICount(1);
          });
        });
      });
    });
  });
});
