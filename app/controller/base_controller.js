'use strict';
const { Controller } = require('egg');
class BaseController extends Controller {

  validate(rule, validateParam = {}) {
    try {
      this.ctx.validate(rule, validateParam);
    } catch (error) {
      this.ctx.logger.warn('[BaseController] [validate] msg-->', error.message);
      this.fail(400, error.message);
    }
  }

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
