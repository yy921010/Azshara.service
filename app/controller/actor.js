'use strict';

const Controller = require('./base_controller');

class ActorController extends Controller {
  async index() {
    const { ctx, ctx: { request } } = this;
    const getActorOption = {};
    if (!(ctx.helper.isEmpty(request.query.pageNumber) || ctx.helper.isEmpty(request.query.pageSize))) {
      getActorOption.num = request.query.pageNumber;
      getActorOption.size = request.query.pageSize;
    } else if (!ctx.helper.isEmpty(request.query.actorId)) {
      getActorOption.whereOpt = {
        ACTOR_ID: request.query.actorId,
      };
    }
    const items = await ctx.service.actor
      .getActors(getActorOption);
    this.success(items);

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
    if (insertResult) {
      this.success({
        message: 'insert actor succeed',
      });
    } else {
      this.fail(500, 'insert actor fail');
    }
  }
}

module.exports = ActorController;
