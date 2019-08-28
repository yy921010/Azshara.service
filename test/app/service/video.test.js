'use strict';
const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/video.test.js', () => {

  it('result has totals', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.video.find({});
    assert(result.total >= 0);
  });

  it('result add success for simple', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.video.add({
      content: {
        contentName: 'test1',
        type: 1,
        contentType: 2,
      },
      pictures: [],
      actors: [],
      definitions: [],
      genres: [],
    });
    assert(result.status === true);
  });

  it('result add success for multiple', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.video.add({
      content: {
        contentName: 'test1',
        type: 1,
        contentType: 2,
      },
      pictures: [
        {
          id: 12,
        },
        {
          id: 113,
        },
      ],
      actors: [{
        id: 1231,
        type: 1,
      }],
      definitions: [{
        id: 1231,
      }],
      genres: [{
        id: 33333,
      }],
    });
    assert(result.status === true);
  });

});
