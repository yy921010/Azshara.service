'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/actor.test.js', () => {

  it('result has total porper', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.actor.getActors({});
    assert(result.total >= 0);
  });

  it('result is object', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.actor.getActors({
      whereOpt: {
        ID: 2,
      },
    });
    assert(typeof result === 'object');
  });

  it('delete actor success', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.actor.deleteActor({
      id: 3,
      actorId: 'eba7e4ca-c178-4c55-8d07-b3b2daa5b97f0e3c56535ec1fce41fd1d48cbb61',
    });
    assert(result);
  });
});
