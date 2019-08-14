'use strict';
const { Controller } = require('egg');
class BaseController extends Controller {

  success(data = {} || [], code = 0) {
    this.ctx.body = {
      success: true,
      data,
      code,
    };
  }

  fail(status = 500, msg = '') {
    this.ctx.throw(status, msg);
  }
}

module.exports = BaseController;
