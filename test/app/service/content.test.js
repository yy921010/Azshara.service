'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/content.test.js', () => {
  it('should exist tf_b_content table', async () => {
    const ctx = app.mockContext();
    const contents = await ctx.service.content.find();
    console.log(contents);
    assert(contents.length >= 0);
  });


  it('should insert tf_b_content table when param is empty', async () => {
    const ctx = app.mockContext();
    const contents = await ctx.service.content.insert();
    assert(contents === false);
  });

  it('should insert tf_b_content table when param is full', async () => {
    const ctx = app.mockContext();
    const insterValue = {
      contentId: 'unit_contentitle',
      contentName: 'unit_contentName',
      type: 1,
      contentType: 2,
      serialNumber: 1,
      rating: 'nc21',
      title: 'unit_title',
      subTitle: 'unit_subtitle',
      introduce: 'unit_introduce',
    };
    const contents = await ctx.service.content.insert(insterValue);
    assert(contents);
  });
});
