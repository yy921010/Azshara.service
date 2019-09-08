'use strict';

const Controller = require('./base_controller');
const validateRule = require('../validate/validate_rules');

class GenresController extends Controller {

  async index() {
    const { ctx, ctx: { request } } = this;
    ctx.validate(validateRule.query, request.query);
    const items = await ctx.service.genres.find({
      num: request.query.pageNumber,
      size: request.query.pageSize,
    });
    this.success(items);
  }


  async update() {
    const { ctx, ctx: { params, request: { body } } } = this;
    ctx.validate(validateRule.genre.update, body);
    ctx.validate(validateRule.updateId, params);
    const { name } = body;
    const { status } = await ctx.service.genres.update({
      name,
      id: params.id,
    });
    return status ? this.success({}) : this.fail(500, '更新失败');

  }

  async destroy() {
    const { ctx, ctx: { params } } = this;
    ctx.validate(validateRule.deleteId, params);
    const { status } = await ctx.service.genres.delete(params.id);
    return status ? this.success({}) : this.fail(500, '删除失败');
  }

  async create() {
    const { ctx } = this;
    ctx.validate(validateRule.genre.update, ctx.request.body);
    const { status } = await ctx.service.genres.add([ ctx.request.body ]);
    return status ? this.success({ topicId: status.topicId }) : this.fail(500, '新增失败');
  }
}

module.exports = GenresController;
