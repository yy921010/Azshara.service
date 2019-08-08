'use strict';
const { Service } = require('egg');
let cacheTotal = 0;
class ActorSerivce extends Service {
  /**
 * 新增人员
 * @param {*} param0
 */
  async insertActor({ actor, picture }) {
    const { ctx, app: { mysql }, config } = this;
    let pictureRealationField = {};
    if (!ctx.helper.isEmpty(picture.id)) {
      Object.assign(actor, {
        actorId: ctx.helper.randamStr(),
      });
      pictureRealationField = ctx.helper.modelToField({
        pictureId: picture.id,
        mainId: actor.actorId,
      });
    }

    const actorField = ctx.helper.modelToField(actor);
    Object.assign(actorField, {
      CREATE_AT: mysql.literals.now,
      UPDATE_AT: mysql.literals.now,
    });

    const result = await mysql.beginTransactionScope(async conn => {
      await conn.insert(config.table.ACTORS, actorField);
      if (!ctx.helper.isEmpty(pictureRealationField)) {
        await conn.insert(config.table.PICTURE_RELATION, pictureRealationField);
      }
      ctx.logger.debug('[ActorService][insertActor] msg--> insert actor and pic_relation success');
      return { success: true };
    }, ctx);
    return result.success;
  }


  async getActors({ size, num, whereOpt }) {
    const pageSize = size || 10,
      pageNumber = num || 1;
    const { ctx, app: { mysql }, config } = this;
    const offset = (pageNumber - 1) * pageSize;
    const countSql = `SELECT COUNT(1) FROM ${config.table.ACTORS}`;
    let sql = ctx.helper.selectColumns({
      table: config.table.ACTORS,
      mapColumns: [ 'id', 'name', 'introduce', 'createAt', 'updateAt', 'actorId' ],
    });
    if (ctx.helper.isEmpty(whereOpt)) {
      sql += mysql._limit(+size, +offset);
      ctx.logger.debug('[ActorService][getActor] sql-->', sql);
      const result = await mysql.beginTransactionScope(async conn => {
        const items = await conn.query(sql);
        if (ctx.helper.isEmpty(cacheTotal)) {
          const total = await conn.query(countSql);
          cacheTotal = total[0]['COUNT(1)'];
        }
        return {
          items,
          total: cacheTotal,
        };
      }, ctx);
      return result;
    }

    sql += mysql._where(whereOpt);
    ctx.logger.debug('[ActorService][getActor] sql-->', sql);
    return await mysql.query(sql);
  }


  async getActorContainPicture(size = 10, num = 1, queryOpt) {
    const { ctx, app: { mysql }, config } = this;
    const offset = (num - 1) * size;
    let sql = ctx.helper.selectColumns(
      {
        table: config.table.ACTORS,
        mapColumns: [ 'id', 'name', 'introduce', 'actorId', 'createAt', 'updateAt' ],
      }, {
        table: config.table.PICTURE,
        mapColumns: [ 'type', 'url' ],
      }, {
        table: config.table.PICTURE_RELATION,
      });
    const equal = {};
    equal[`${config.table.ACTORS}.ACTOR_ID`] = `${config.table.PICTURE_RELATION}.MAIN_ID`;
    equal[`${config.table.PICTURE}.ID`] = `${config.table.PICTURE_RELATION}.PICTURE_ID`;
    sql += ctx.helper.whereMultiTable({
      equal,
    });
    if (ctx.helper.isEmpty(queryOpt)) {
      sql += mysql._limit(size, offset);
      ctx.logger.debug('[ActorService][getActor] sql-->', sql);
      const result = await mysql.query(sql);
      return result;
    }
    mysql._where(queryOpt.where);
    ctx.logger.debug('[ActorService][getActor] sql-->', sql);
    const result = await mysql.query(sql);
    return result;
  }

  async deleteActor({ id, actorId }) {
    const { ctx, app: { mysql }, config } = this;
    if (ctx.helper.isEmpty(actorId)) {
      return false;
    }
    const result = await mysql.beginTransactionScope(async conn => {
      await conn.delete(config.table.ACTORS, {
        ID: id,
      });

      if (!ctx.helper.isEmpty(actorId)) {
        const sql = `DELETE FROM ${config.table.PICTURE} 
                     WHERE ID 
                     IN 
                     (SELECT PICTURE_ID FROM ${config.table.PICTURE_RELATION}  WHERE MAIN_ID=${mysql.escape(actorId)})`;
        ctx.logger.debug('[ActorService][deleteActor] sql-->', sql);
        await conn.query(sql);
        await conn.delete(config.table.PICTURE_RELATION, {
          MAIN_ID: actorId,
        });
      }
      return true;
    }, ctx);

    return result;
  }

}


module.exports = ActorSerivce;
