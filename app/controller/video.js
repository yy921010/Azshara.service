'use strict';
const Controller = require('./base_controller');
const actorRule = require('../validate/actor_rule');

class VideoController extends Controller {
  async index() {
    const { ctx, ctx: { request } } = this;
    ctx.validate(actorRule.query, request.query);
    const items = await ctx.service.video
      .getVideos({
        num: request.query.pageNumber,
        size: request.query.pageSize,
      });
    this.success(items);
  }
  async show() {
    const { ctx, ctx: { params } } = this;
    const { id } = params;
    const item = await ctx.service.actor.getVideos({
      id,
    });
    this.success(item);
  }
  async create() {}
  async update() {}
}
module.exports = VideoController;
