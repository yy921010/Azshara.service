'use strict';
const Controller = require('./base_controller');
const validate = require('../validate/validate_rules');

class VideoController extends Controller {

  async index() {
    const { ctx, ctx: { request } } = this;
    ctx.validate(validate.query, request.query);
    const items = await ctx.service.video
      .find({
        num: request.query.pageNumber,
        size: request.query.pageSize,
      });
    this.success(items);
  }

  async create() {

  }
  async update() {}
}
module.exports = VideoController;
