'use strict';
const { Controller } = require('egg');
class BaseController extends Controller {

  success(data = {} || [], code = 0) {
    this.ctx.body = {
      status: 'success',
      data,
      code,
    };
  }

  fail(msg = '', code = 0) {
    this.ctx.body = {
      msg,
      code,
      status: 'failed',
    };
  }
}

module.exports = BaseController;
