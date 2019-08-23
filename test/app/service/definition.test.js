'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/definition.test.js', () => {

  it('test add result true', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.definition.add(
      [{
        url: 'test1',
        type: 1,
      }, {
        url: 'test2',
        type: 2,
      }]);
    assert(result.status === true);
  });


  it('test add result false', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.definition.add([]);
    assert(result.status === false);
  });


  it('test update result true', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.definition.update({
      id: 1,
      url: 'test_update',
      type: 5,
    });
    assert(result.status === true);
  });


  it('test delete result true', async () => {
    const ctx = app.mockContext();
    const result = await ctx.service.definition.delete(1);
    assert(result.status === true);
  });

});
