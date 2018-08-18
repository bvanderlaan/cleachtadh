'use strict';

suite('Status Route', () => {
  suite('Multiple requests in Parallel', () => {
    options({
      runMode: 'parallel',
      minSamples: 400,
      maxTime: 20,
    });

    route('status', {
      method: 'get',
      route: 'status',
      expectedStatusCode: 200,
      maxMean: 0.2, // 200ms
    });
  });

  suite('Multiple requests in Sequence', () => {
    options({
      runMode: 'sequential',
      minSamples: 400,
      maxTime: 20,
    });

    route('status', {
      method: 'get',
      route: 'status',
      expectedStatusCode: 200,
      maxMean: 0.12, // 120ms
    });
  });
});
