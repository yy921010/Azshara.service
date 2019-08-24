'use strict';

const Controller = require('./base_controller');
const validateRule = require('../validate/validate_rules');

class ActorController extends Controller {
  async index() {
    const { ctx, ctx: { request } } = this;
    ctx.validate(validateRule.query, request.query);
    const items = await ctx.service.actor
      .getActors({
        num: request.query.pageNumber,
        size: request.query.pageSize,
      });
    this.success(items);
  }

  async show() {
    const { ctx, ctx: { params } } = this;
    const { id } = params;
    const item = await ctx.service.actor.getActors({
      id,
    });
    this.success(item);
  }

  async update() {
    const { ctx, ctx: { params, request: { body } } } = this;
    const { actor, picture } = body;
    const { id } = params;
    actor.id = id;
    const { status } = await ctx.service.updateActor({ actor, picture });
    if (status) {
      this.success({});
    }
  }

  async destroy() {
    const { ctx, ctx: { params, request: { body } } } = this;
    await ctx.service.actor.deleteActor({
      id: params.id,
      actorId: body.actorId,
    });
    return this.success(params.id);
  }

  async create() {
    const { ctx } = this;
    ctx.validate(validateRule.actor.insert, ctx.request.body);
    const insertResult = await ctx.service.actor.insertActor({
      actor: {
        name: ctx.request.body.name,
        introduce: ctx.request.body.introduce,
      },
      picture: {
        id: ctx.request.body.imageId,
      },
    });
    if (insertResult.status) {
      this.success({
        topicId: insertResult.actorInsertId,
      });
    } else {
      this.fail(500, 'insert actor fail');
    }
  }


}

module.exports = ActorController;
