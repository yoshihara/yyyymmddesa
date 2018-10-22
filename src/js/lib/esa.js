'use strict';

import https from 'https';
import querystring from 'querystring';
import Promise from 'bluebird';

export default class Esa {
  constructor(token) {
    this.token = token;
  }

  async fetchPosts(teamName, q) {
    let count = 1;
    let nextPage = 1;
    let posts = [];

    while (nextPage) {
      let body = await this.getPostsPerPage(teamName, q, count);

      posts = posts.concat(body.posts);
      nextPage = body['next_page'];
      count++;
    }

    return posts;
  }

  getPostsPerPage(teamName, q, page) {
    return new Promise((resolve, reject) => {
      let options = {
        port: 443,
        hostname: 'api.esa.io',
        path: `/v1/teams/${teamName}/posts?${querystring.stringify(
          q,
        )}&per_page=30&page=${page}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      };

      https
        .get(options, (res) => {
          let body = '';
          res.setEncoding('utf8');

          res.on('data', (chunk) => {
            body += chunk;
          });

          res.on('end', (_res) => {
            resolve(JSON.parse(body));
          });
        })
        .on('error', (e) => {
          console.error(e);
          reject(e);
        });
    });
  }
}
