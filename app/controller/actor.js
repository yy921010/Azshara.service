'use strict';

const Controller = require('./base_controller');

class ActorController extends Controller {
  async index() {
    const { ctx } = this;

    ctx.body = await ctx.service.content.getActor();
  }

  async create() {
    const { ctx } = this;
    this.validate({
      name: {
        type: 'string',
        require: false,
      },
      introduce: {
        type: 'string',
        require: false,
      },
      imageId: {
        type: 'string',
        require: false,
      },
    }, ctx.request.body);

    const insertResult = await ctx.service.content.insertActor({
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
