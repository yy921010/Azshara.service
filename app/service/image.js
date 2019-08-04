'use strict';
const { Service } = require('egg');

module.exports = class ImageService extends Service {

  async saveImage(image = {}) {
    const { app: { mysql }, ctx, config } = this;
    ctx.logger.debug('[imageService] [saveImage] enter');
    image = ctx.helper.modelToField(image);
    const result = await mysql.insert(config.table.PICTURE, image);
    return result;
  }


  async deleteImage(imageId) {
    const { app: { mysql }, ctx, config } = this;
    ctx.logger.debug('[imageService] [deleteImage] enter');
    const result = await mysql.delete(config.table.PICTURE, {
      ID: imageId,
    });
    return result;
  }
};
