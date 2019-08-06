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


  it('func selectColumns for sigle table', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.selectColumns({
      table: 'TEST',
      mapColumns: [ 'userName', 'age' ],
    });
    ctx.helper._makeUploadDir();
    assert(contents === 'SELECT TEST.USER_NAME AS userName,TEST.AGE AS age FROM TEST');
  });


  it('func selectColumns for multipart tables', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.selectColumns(
      {
        table: 'TABLE1',
        mapColumns: [ 'name' ],
      },
      {
        table: 'TABLE2',
        mapColumns: [ 'userName', 'password' ],
      },
      {
        table: 'TABLE3',
        mapColumns: [ 'nickName', 'thirdPassLink' ],
      }
    );
    assert(contents === 'SELECT TABLE1.NAME AS name,TABLE2.USER_NAME AS userName,TABLE2.PASSWORD AS password,TABLE3.NICK_NAME AS nickName,TABLE3.THIRD_PASS_LINK AS thirdPassLink FROM TABLE1,TABLE2,TABLE3');
  });


  it('func selectColumns for multipart tables not mapColumns', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.selectColumns(
      {
        table: 'TABLE1',
        mapColumns: [ 'name' ],
      },
      {
        table: 'TABLE2',
      },
      {
        table: 'TABLE3',
        mapColumns: [ 'nickName', 'thirdPassLink' ],
      }
    );
    assert(contents === 'SELECT TABLE1.NAME AS name,TABLE3.NICK_NAME AS nickName,TABLE3.THIRD_PASS_LINK AS thirdPassLink FROM TABLE1,TABLE2,TABLE3');
  });


  it('func _toUpperCaseKey', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.toUpperCaseKey('userName');
    assert(contents === 'USER_NAME');
  });


  it('func whereMultiTable', () => {
    const ctx = app.mockContext();
    const contents = ctx.helper.whereMultiTable({
      equal: {
        'test.id': 'test1.id',
      },
      query: {
        'test.id': 1,
      },
    });
    assert(contents === ' WHERE test.id = test1.id AND test.id = 1');
  });


});
