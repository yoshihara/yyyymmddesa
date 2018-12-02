'use strict';

import Promise from 'bluebird';

import Esa from '../src/js/lib/esa';
jest.unmock('../src/js/lib/esa.js');

describe('Esa', () => {
  const token = 'token';
  const teamName = 'test-team';
  const esa = new Esa(token);

  describe('#fetchPosts', () => {
    beforeAll(() => {});

    it('should request Esa search API', async () => {
      esa.fetchPostsPerPage = jest.fn();
      const expectedResponses = [
        { posts: ['post1'], next_page: 2 },
        { posts: ['post2'], next_page: 3 },
        { posts: ['last post'], next_page: null },
      ];

      expectedResponses.forEach((response) => {
        esa.fetchPostsPerPage.mockReturnValueOnce(
          new Promise((resolve, _) => {
            resolve(response);
          }),
        );
      });

      const q = 'search query';

      const actualPosts = await esa.fetchPosts(teamName, q);

      for (let page = 1; page < 3; page++) {
        expect(esa.fetchPostsPerPage.mock.calls[page - 1]).toEqual([
          teamName,
          q,
          page,
        ]);
      }

      let expectedPosts = [];
      expectedResponses.forEach((res) => {
        expectedPosts = expectedPosts.concat(res.posts);
      });
      expect(actualPosts).toEqual(expectedPosts);
    });
  });
});
