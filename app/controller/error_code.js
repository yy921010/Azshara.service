'use strict';
/**
 * 错误码命名规则 00-00-00
 * 第一组:00 为业务模块，规则自左向右：如 用户模块 10, 设备模块 20
 * 第二组:00 为错误层级，指是在哪一层出错，如 controller:10 service 20 helper 30
 * 第三组:00 为状态 10 失败
 * @type {{USER_ADD_FAIL: string}}
 */
module.exports = {
  USER_ADD_FAIL: '101010',
};

