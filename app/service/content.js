'use strict';
const { Service } = require('egg');

class ContentService extends Service {


  /**
     * 表 actor,content, definition,picture,geners
     * @param {*} param0
     */
  insertContent({ contents, picture }) {

  }

  /**
 * 新增人员
 * @param {*} param0
 */
  async insertActor({ actor, picture }) {
    const { ctx, app: { mysql }, config } = this;
    Object.assign(actor, {
      actorId: ctx.helper.randamStr(64),
    });
    const pictureRealationField = ctx.helper.modelToField({
      pictureId: picture.id,
      mainId: actor.actorId,
    });
    const actorField = ctx.helper.modelToField(actor);
    Object.assign(actorField, {
      CREATE_AT: mysql.literals.now,
      UPDATE_AT: mysql.literals.now,
    });

    const result = await mysql.beginTransactionScope(async conn => {
      await conn.insert(config.table.ACTORS, actorField);
      await conn.insert(config.table.PICTURE_RELATION, pictureRealationField);
      ctx.logger.debug('[ContentService][insertActor] msg--> insert actor and pic_relation success');
      return { success: true };
    }, ctx);
    return result.success;

  }


  async getActor(size = 10, num = 1, queryOpt) {
    const { ctx, app: { mysql }, config } = this;
    const offset = (num - 1) * size;
    let sql = ctx.helper.selectColumns(config.table.ACTORS, {
      id: 'ID',
      name: 'NAME',
      introduce: 'INTRODUCE',
      actionId: 'ACTOR_ID',
      createAT: 'CREATE_AT',
      updateAt: 'UPDATE_AT',
    });
    if (!queryOpt) {
      sql += mysql._limit(size, offset);
      return await mysql.query(sql);
    }
    mysql._where(queryOpt.where);
    ctx.logger.debug('[ContentService][getActor] sql-->', sql);
    return await mysql.query(sql);
  }
}

module.exports = ContentService;
