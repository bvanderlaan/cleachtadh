'use strict';

const request = require('superagent');

const server = require('../index.bench');

suite('Katas Route', () => {
  let kataIds = [];

  before(() => {
    const katas = Array.from(new Array(100), (_, i) => i)
      .map((_, i) => (
        request.post(`${server.url}/v1/katas`)
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
