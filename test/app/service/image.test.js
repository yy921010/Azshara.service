'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/image.test.js', () => {
  it('get actors', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.image.deleteImage();
    assert(result.length >= 0);
  });
});
