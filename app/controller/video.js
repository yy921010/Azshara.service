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
    const { ctx } = this;
    ctx.validate(validate.video, ctx.request.body);

    const insertResult = await ctx.service.video.add({
      content: ctx.request.body.content,
      pictures: ctx.request.body.pictures,
      actors: ctx.request.body.actors,
      definitions: ctx.request.body.definitions,
      genres: ctx.request.body.genres,
    });
    if (insertResult.status) {
      this.success({
        topicId: insertResult.actorInsertId,
      });
    } else {
      this.fail(500, 'insert actor fail');
    }
  }
  async update() {

  }

  async destroy() {
    const { ctx, ctx: { params } } = this;
    await ctx.service.video.delete({
      id: params.id,
    });
    return this.success(params.id);
  }
}
module.exports = VideoController;
