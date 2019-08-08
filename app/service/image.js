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
    console.log(sql);
    return await mysql.query(sql);
  }
};
