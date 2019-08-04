'use strict';

const Controller = require('./base_controller');
const awaitStreamReady = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const path = require('path');

class ImageController extends Controller {

  async index() {
    const { ctx, config } = this;
    const stream = await ctx.getFileStream();
    const { mimeType, fields: { scope, fixed } } = stream;
    const imageType = mimeType.split('/')[1];
    const fileName = ctx.helper.randamStr() + `.${imageType}`;
    const month = ctx.helper.dayjs().month() + 1;
    const targetPath = ctx.helper.getMkdirName(
      config.upload.media,
      scope,
      ctx.helper.dayjs().year(),
      month,
      ctx.helper.dayjs().date(),
      ctx.helper.dayjs().hour(),
      fixed
    );
    const writeStream = fs.createWriteStream(path.join(targetPath, fileName));
    try {
      await awaitStreamReady(stream.pipe(writeStream));
      ctx.logger.debug('[ImageController][index][msg]--> insert dir image Success');
      const setImagePath = ctx.helper.pathName(
        config.upload.media,
        scope,
        this.getTimePath(),
        fixed,
        fileName);
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
          imageService: config.upload.imageService,
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


  getTimePath() {
    const { ctx } = this;
    const year = ctx.helper.dayjs().year() + '',
      month = ctx.helper.dayjs().month() + 1 + '',
      date = ctx.helper.dayjs().date() + '',
      hour = ctx.helper.dayjs().hour() + '';
    return `${year}/${month}/${date}/${hour}`;
  }


  async deleteImage() {
    const { ctx, config: { upload: { baseDir } } } = this;
    this.validate({
      id: {
        type: 'string',
        require: false,
      },
      fileName: {
        type: 'string',
        require: false,
      },
      filePath: {
        type: 'string',
        require: false,
      },
    }, ctx.query);
    const { id, fileName, filePath } = ctx.query;
    const deletePath = path.join(this.config.baseDir, baseDir, filePath);
    const deleteResult = ctx.helper.deleteFileByName(fileName, deletePath);
    ctx.logger.debug('ImageController][deleteImage] deletePath-->', deletePath);
    if (deleteResult) {
      ctx.logger.debug('[ImageController][deleteImage][msg]--> delete image Success');
      const result = await ctx.service.image.deleteImage(+id);
      if (result.affectedRows === 1) {
        this.success('delete success');
      } else {
        this.fail(500, 'delete image database fail!');
      }
    } else {
      ctx.logger.debug('[ImageController][deleteImage][msg]--> delete image fail');
      this.fail(500, 'delete image fail!');
    }
  }

}

module.exports = ImageController;
