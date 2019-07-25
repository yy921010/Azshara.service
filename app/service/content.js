'use strict';
const { Service } = require('egg');

class ContentService extends Service {
  async find(size = 10, num = 1, queryOpt) {
    const { ctx, config, app: { mysql } } = this;
    const offset = (num - 1) * size;
    ctx.logger.debug('[ContentService][findBySizeAndNumber][offset]: %d', offset);
    ctx.logger.debug('[ContentService][findBySizeAndNumber][pageNumber]: %d', num);
    let contentSql = ctx.helper.selectColumns(config.table.CONTENT, {
      id: 'ID',
      contentId: 'CONTENT_ID',
      contentName: 'CONTENT_NAME',
      type: 'TYPE',
      contentType: 'CONTENT_TYPE',
      serialNumber: 'SERIAL_NUMBER',
      rating: 'RATING',
      title: 'TITLE',
      subTitle: 'SUB_TITLE',
      introduce: 'INTRODUCE',
      createTime: 'CREATE_TIME',
      updateTime: 'UPDATE_TIME',
    });
    if (!queryOpt) {
      contentSql += mysql._limit(size, offset);
      return await mysql.query(contentSql);
    }
    ctx.logger.debug('[ContentService][findBySizeAndNumber][queryOpt]:', JSON.stringify(queryOpt));
    mysql._where(queryOpt.where);
    return await mysql.query(contentSql);
  }

  async insert(content = {}) {
    const { ctx, config, app } = this;
    if (ctx.helper.isEmpty(content)) {
      ctx.logger.info('[ContentService][findBySizeAndNumber][insert] [msg] content is empty');
      return false;
    }
    content = ctx.helper.modelToField(content);
    content = Object.assign(content, {
      CREATE_TIME: app.mysql.literals.now,
      UPDATE_TIME: app.mysql.literals.now,
    });
    ctx.logger.debug('[ContentService][findBySizeAndNumber][insert] [content]', content);
    const result = await app
      .mysql.insert(config.table.CONTENT, content);
    return result.affectedRows === 1;
  }


}

module.exports = ContentService;
