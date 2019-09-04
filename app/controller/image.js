'use strict';

const Controller = require('./base_controller');
const awaitStreamReady = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const path = require('path');
const validateRule = require('../validate/validate_rules');

class ImageController extends Controller {

  async create() {
    const { ctx, config } = this;
    const stream = await ctx.getFileStream();
    const { mimeType, fields: { scope, fixed } } = stream;
    const imageType = mimeType.split('/')[1];
    const fileName = ctx.helper.randamStr() + `.${imageType}`;
    const month = ctx.helper.dayjs()
        .month() + 1,
      date = ctx.helper.dayjs()
        .date(),
      year = ctx.helper.dayjs()
        .year(),
      hour = ctx.helper.dayjs()
        .hour();

    const targetPath = ctx.helper.getMkdirName(config.upload.media, scope,
      year,
      month,
      date,
      hour,
      fixed
    );

    const writeStream = fs.createWriteStream(path.join(targetPath, fileName));
    try {
      await awaitStreamReady(stream.pipe(writeStream));
      ctx.logger.debug('[ImageController][index][msg]--> insert dir image Success');
      const setImagePath = ctx.helper.pathName(config.upload.media, scope, this.getTimePath(), fixed, fileName);
      const { affectedRows, insertId } = await ctx.service.image.saveImage({
        url: setImagePath,
        type: fixed,
      });
      if (affectedRows === 1) {
        ctx.logger.debug('[ImageController][index][msg]--> insert image database Success');
        this.success({
          fileName,
          path: ctx.helper.pathName(
            config.upload.media,
            scope,
            this.getTimePath(),
            fixed
          ),
          imageId: insertId,
        });
      } else {
        this.fail(500, 'insert image database fail!');
      }
    } catch (err) {
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      ctx.logger.error('[ImageController][index][msg]--> insert image dir fail');
      await sendToWormhole(stream);
      throw err;
    }
  }

  async destroy() {
    const { ctx } = this;
    ctx.validate(validateRule.deleteId, ctx.params);
    const { id } = ctx.params;
    // 根据id做删除
    const { url } = await this.service.image.findUrlThenDeleteById(id);
    let deleteResult = false;
    if (!ctx.helper.isEmpty(url)) {
      deleteResult = ctx.helper.deleteFileByName(url);
    }
    return deleteResult ? this.success('delete success') : this.fail(500, 'delete image fail!');
  }


  async index() {
    const { ctx, ctx: { request } } = this;
    const query = request.query;
    if (query.mainId) {
      const results = await ctx.service.image.getImageWithMainId(query.mainId);
      return this.success(results);
    }
    return this.success({});
  }


  getTimePath() {
    const { ctx } = this;
    const year = ctx.helper.dayjs()
        .year() + '',
      month = ctx.helper.dayjs()
        .month() + 1 + '',
      date = ctx.helper.dayjs()
        .date() + '',
      hour = ctx.helper.dayjs()
        .hour() + '';
    return `${year}/${month}/${date}/${hour}`;
  }

}

module.exports = ImageController;
