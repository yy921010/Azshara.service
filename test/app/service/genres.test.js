'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/genres.test.js', () => {

  it('test add result true', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.genres.add(
      [{
        name: 'test1',
      }, {
        name: 'test2',
      }]);
    assert(result.status === true);
  });


  it('test add result false', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.genres.add([]);
    assert(result.status === false);
  });


  it('test update result true', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.genres.update({
      id: 2,
      name: 'test_update',
    });
    assert(result.status === true);
  });


  it('test delete result true', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.genres.delete(1);
    assert(result.status === true);
  });

});
