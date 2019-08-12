'use strict';

const Controller = require('./base_controller');

class ActorController extends Controller {
  async index() {
    const { ctx, ctx: { request } } = this;
    this.validate({
      pageNumber: {
        type: 'string',
        require: false,
      },
      pageSize: {
        type: 'string',
        require: false,
      },
    }, request.query);
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
    const items = await ctx.service.actor.getActors({
      whereOpt: {
        ACTOR_ID: id,
      },
    });
    this.success(items);
  }

  async update() {

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
    this.validate({
      name: {
        type: 'string',
        required: false,
      },
      introduce: {
        type: 'string',
        required: false,
      },
      imageId: {
        type: 'string',
        required: false,
      },
    }, ctx.request.body);

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
        topicId: insertResult.inserId,
      });
    } else {
      this.fail(500, 'insert actor fail');
    }
  }


}

module.exports = ActorController;
