'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/image.test.js', () => {
  it('get a result', async () => {
    const ctx = app.mockContext();
    assert(true);
  });
});
