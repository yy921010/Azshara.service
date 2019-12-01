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

  async getExtraData() {
    const { ctx, ctx: { query } } = this;
    const mainId = query.contentId;
    const finalResult = await ctx.service.video.getExtraData(mainId);
    this.success(finalResult);
  }

  async create() {
    const { ctx } = this;
    ctx.validate(validate.video, ctx.request.body);
    let pictureIds = ctx.request.body.pictureIds.split(',');
    let definitionIds = ctx.request.body.definitionIds.split(',');
    pictureIds = ctx.helper.compact(pictureIds);
    definitionIds = ctx.helper.compact(definitionIds);
    const insertResult = await ctx.service.video.add({
      content: ctx.helper.parseObject(ctx.request.body.content),
      pictureIds,
      actors: ctx.helper.parseObject(ctx.request.body.actors),
      definitionIds,
      genreId: ctx.request.body.genreId,
    });

    if (insertResult.status) {
      this.success({
        topicId: insertResult.contentInsertId,
      });
    } else {
      this.fail(500, 'insert actor fail');
    }
  }

  async update() {

  }

  async destroy() {
    const { ctx, ctx: { params } } = this;
    await ctx.service.video.delete(+params.id);
    return this.success(params.id);
  }
}
module.exports = VideoController;
