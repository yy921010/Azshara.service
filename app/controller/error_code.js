'use strict';
/**
 * 错误码命名规则 00-00-00
 * 第一组:00 为业务模块，规则自左向右：如 用户模块 10, 设备模块 20 邮箱 30
 * 第二组:00 为操作 如 add:10 query 20 update 30 delete 40
 * 第三组:00 为状态 失败:00 存在：10
 * @type {{USER_ADD_FAIL: string}}
 */
module.exports = {
  userAddFail: '101010',
  userHasExist: '102010',
  userEmailIsExist: '102010',
  userValidateFailed: '102000',
  deviceAddFailed: '201000',
  deviceDeleteFailed: '204000',
  deviceUpdateFailed: '203000',
  emailValidateFailed: '302000',
};

