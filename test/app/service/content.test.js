'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/content.test.js', () => {
  it('get actors', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.content.getActor();
    assert(result.length >= 0);
  });
});
