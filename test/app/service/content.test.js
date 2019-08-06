'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/content.test.js', () => {

  it('get actors when param is {}', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.content.getActors({});
    assert(result.length >= 0);
  });

  it('get actors when id is 2', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.content.getActors({
      whereOpt: {
        ID: 2,
      },
    });
    assert(typeof result === 'object');
  });
});
