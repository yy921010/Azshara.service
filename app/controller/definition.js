'use strict';

const Controller = require('./base_controller');
const validateRule = require('../validate/validate_rules');

class DefinitionController extends Controller {
  async index() {
    const { ctx, ctx: { request } } = this;
    ctx.validate(validateRule.query, request.query);
    const items = await ctx.service.definition.find({
      num: request.query.pageNumber,
      size: request.query.pageSize,
    });
    this.success(items);
  }


  async update() {
    const { ctx, ctx: { params, request: { body } } } = this;
    ctx.validate(validateRule.definition, body);
    ctx.validate(validateRule.queryId, params);
    const { type, url } = body;
    const { status } = await ctx.service.definition.update({
      type,
      url,
    });
    return status ? this.success({}) : this.fail(500, '更新失败');

  }

  async show() {
    const { ctx, ctx: { params } } = this;
    const { id } = params;
    const item = await ctx.service.definition.findByContentId(id);
    this.success(item);
  }

  async destroy() {
    const { ctx, ctx: { params } } = this;
    ctx.validate(validateRule.deleteId, params);
    const { status } = await ctx.service.definition.delete(params.id);
    return status ? this.success({}) : this.fail(500, '删除失败');
  }

  async create() {
    const { ctx } = this;
    ctx.validate(validateRule.definition, ctx.request.body);
    const { status, topicId } = await ctx.service.definition.add([ ctx.request.body ]);
    return status ? this.success({
      topicId,
    }) : this.fail(500, '新增失败');
  }
}

module.exports = DefinitionController;
