'use strict';

const request = require('superagent');
const uuid = require('uuid/v4');

const server = require('../index.bench');

const createUser = (...{ displayName = 'Rocket Racoon', email = `rocket+${uuid()}@gmail.com` }) => (
  request.post(`${server.url}/v1/signup`)
    .send({
      displayName,
      email,
      password: 'password',
    })
    .then(response => response.body.token)
);

suite('Katas Route', () => {
  let kataIds = [];
  let token;

  before(() => (
    createUser()
      .then(userToken => (token = userToken))
  ));

  before(() => {
    const katas = Array.from(new Array(100), (_, i) => i)
      .map((_, i) => (
        request.post(`${server.url}/v1/katas`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `my first system kata (${i})`,
            description: 'this is how we do it',
          })
      ));

    return Promise.all(katas)
      .then((responses) => {
        kataIds = responses.map(res => res.body.id);
      });
  });

  after(() => {
    const requests = kataIds.map(kataId => (
      request.delete(`${server.url}/v1/katas/${kataId}`)
        .set('Authorization', `Bearer ${token}`)
    ));
    return Promise.all(requests);
  });

  suite('Multiple requests in Parallel', () => {
    options({
      runMode: 'parallel',
      minSamples: 400,
      maxTime: 20,
    });

    route('Fetch 100 Katas', {
      method: 'get',
      route: 'v1/katas',
      expectedStatusCode: 200,
      maxMean: 1.1, // 1.1s
    });
  });

  suite('Multiple requests in Sequence', () => {
    options({
      runMode: 'sequential',
      minSamples: 400,
      maxTime: 20,
    });

    route('Fetch 100 Katas', {
      method: 'get',
      route: 'v1/katas',
      expectedStatusCode: 200,
      maxMean: 0.9, // 900ms
    });
  });
});
