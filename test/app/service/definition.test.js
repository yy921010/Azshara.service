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

});
