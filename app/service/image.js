'use strict';
const { Service } = require('egg');

module.exports = class ImageService extends Service {

  async saveImage(image = {}) {
    const { app: { mysql }, ctx, config } = this;
    ctx.logger.debug('[imageService] [saveImage] enter');
    image = ctx.helper.modelToField(image);
    return await mysql.insert(config.table.PICTURE, image);
  }


  async deleteImage(imageId) {
    const { app: { mysql }, ctx, config } = this;
    ctx.logger.debug('[imageService] [deleteImage] enter');
    return await mysql.delete(config.table.PICTURE, {
      ID: imageId,
    });
  }

  async getImageWithMainId(mainId = '') {
    const { app: { mysql }, ctx, config } = this;
    ctx.logger.debug('[imageService] [getImageById] enter');
    let sql = ctx.helper.selectColumns(
      {
        table: config.table.PICTURE,
        mapColumns: [ 'id', 'type', 'url' ],
      },
      {
        table: config.table.PICTURE_RELATION,
      }
    );
    const equal = {};
    equal[`${config.table.PICTURE}.ID`] = `${config.table.PICTURE_RELATION}.PICTURE_ID`;
    const query = {};
    query[ `${config.table.PICTURE_RELATION}.MAIN_ID`] = mysql.escape(mainId);
    sql += ctx.helper.whereMultiTable({
      equal,
      query,
    });
    return await mysql.query(sql);
  }
};
