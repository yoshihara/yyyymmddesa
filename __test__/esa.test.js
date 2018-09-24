'use strict';

import Esa from '../src/js/lib/esa';
jest.unmock('../src/js/lib/esa.js');

import Promise from 'bluebird';
import https from 'https';

describe('Esa', () => {
  const token = 'token';
  const teamName = 'test-team';

  describe('#getPosts', () => {
    beforeAll(() => {
      https.get = jest.fn(() => {
        return new Promise(() => {});
      });
    });

    it('should request Esa search API', () => {
      const esa = new Esa(token);
      const q = 'search query';

      esa
        .getPosts(teamName, q)
        .then(() => {})
        .catch(() => {});

      let options = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        hostname: 'api.esa.io',
        method: 'GET',
        path: `/v1/teams/${teamName}/posts?`,
        port: 443,
      };
      expect(https.get.mock.calls[0][0]).toEqual(options);
      expect(typeof https.get.mock.calls[0][1]).toEqual(
        'function', // callback
      );
    });
  });
});
