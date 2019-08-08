'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/image.test.js', () => {
  it('get a result', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.image.getImageWithMainId('03e11d5b-abd9-46-8-');
    assert(result.length === 1);
  });
});
