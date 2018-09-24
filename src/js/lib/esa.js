'use strict';

import https from 'https';
import querystring from 'querystring';

export default class Esa {
  constructor(token) {
    this.token = token;
  }

  getPosts(teamName, q) {
    let options = {
      port: 443,
      hostname: 'api.esa.io',
      path: `/v1/teams/${teamName}/posts?${querystring.stringify(q)}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    };

    return new Promise((resolve, reject) => {
      https
        .get(options, res => {
          let body = '';
          res.setEncoding('utf8');

          res.on('data', chunk => {
            body += chunk;
          });

          res.on('end', res => {
            resolve(body);
          });
        })
        .on('error', e => {
          console.error(e);
          reject(e);
        });
    });
  }
}
