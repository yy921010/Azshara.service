'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/extend/helper.test.js', () => {

  it('func isEmpty is true,when param is {}', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.isEmpty({});
    assert(contents);
  });


  it('func isEmpty is true,when param is null', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.isEmpty(null);
    assert(contents);
  });


  it('func isEmpty is false,when param is { name: "1"}', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.isEmpty({ name: '1' });
    assert(contents === false);
  });

  it('func modelToField value is {"NAME":"1","USER_NAME":"userDemo"}', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.modelToField({
      name: '1',
      userName: 'userDemo',
    });
    assert(JSON.stringify(contents) === '{"NAME":"1","USER_NAME":"userDemo"}');
  });


  it('func makeModelField is TEST.USER_NAME AS userName, TEST.AGE AS age', () => {
    const ctx = app.mockContext();
    const fieldMap = {
      userName: 'USER_NAME',
      age: 'AGE',
    };
    const contents = ctx.helper.makeModelField('TEST', fieldMap);
    assert(contents === 'TEST.USER_NAME AS userName, TEST.AGE AS age');
  });

  it('func selectColumns', () => {
    const ctx = app.mockContext();
    const fieldMap = {
      userName: 'USER_NAME',
      age: 'AGE',
    };
    const contents = ctx.helper.selectColumns('TEST', fieldMap);
    ctx.helper._makeUploadDir();
    assert(contents === 'SELECT TEST.USER_NAME AS userName, TEST.AGE AS age FROM TEST');
  });


});
