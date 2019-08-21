'use strict';
const { Service } = require('egg');
let cacheTotal = 0;

class ActorService extends Service {
  /**
   * 新增人员
   * @param {*} param 包含图片和演员
   */
  async insertActor({ actor, picture }) {
    const { ctx, app: { mysql }, config } = this;
    cacheTotal = null;
    let pictureRelationField = {};
    if (picture.id) {
      actor.pictureId = ctx.helper.randamStr();
      pictureRelationField = ctx.helper.modelToField({
        pictureId: picture.id,
        mainId: actor.pictureId,
        updateAt: mysql.literals.now,
        createAt: mysql.literals.now,
      });
    }
    actor.createAt = mysql.literals.now;
    actor.updateAt = mysql.literals.now;
    const actorField = ctx.helper.modelToField(actor);
    const finalResult = {
      status: false,
      actorInsertId: '',
    };
    return await mysql.beginTransactionScope(async conn => {
      let picVal = {};
      const insertVal = await conn.insert(config.table.ACTORS, actorField);
      if (picture.id) {
        picVal = await conn.insert(config.table.PICTURE_RELATION, pictureRelationField);
        ctx.logger.debug('[ActorService][insertActor] msg--> insert actor and pic_relation success');
      }
      if (picVal.affectedRows === 1 || insertVal.affectedRows === 1) {
        finalResult.status = true;
        finalResult.actorInsertId = insertVal.insertId;
      } else {
        ctx.logger.warn('[ActorService][insertActor] msg--> insert actor or PICTURE_RELATION fail');
      }
      return finalResult;
    }, ctx);
  }

  /**
   * 删除演员
   * @param {id,picture} params 演员的图片id和pictureId
   * @return {Promise<boolean|*>}
   */
  async deleteActor({ id, pictureId }) {
    const { ctx, app: { mysql }, config } = this;
    cacheTotal = null;
    if (!id) {
      return new Promise(resolve => {
        ctx.logger.warn('[ActorService][deleteActor] msg--> actorId is empty');
        resolve({
          status: false,
        });
      });
    }
    return await mysql.beginTransactionScope(async conn => {
      await conn.delete(config.table.ACTORS, {
        ID: id,
      });
      if (pictureId) {
        const sql = `DELETE FROM ${config.table.PICTURE} WHERE ID IN 
        (SELECT PICTURE_ID FROM ${config.table.PICTURE_RELATION}  WHERE MAIN_ID = ${mysql.escape(pictureId)})`;
        ctx.logger.debug('[ActorService][deleteActor] sql-->', sql);
        await conn.query(sql);
        await conn.delete(config.table.PICTURE_RELATION, {
          MAIN_ID: pictureId,
        });
      }
      return {
        status: true,
      };
    }, ctx);
  }


  /**
   * 修改actor
   * @param {actor, picture} params
   * @return {Promise<*>}
   */
  async updateActor({ actor, picture }) {
    const { ctx, app: { mysql }, config } = this;
    actor.updateAt = mysql.literals.now;
    actor = ctx.helper.modelToField(actor, true);
    cacheTotal = null;
    if (!ctx.helper.isEmpty(picture)) {
      picture.updateAt = mysql.literals.now;
      picture = ctx.helper.modelToField(picture, true);
    }
    return await mysql.beginTransactionScope(async conn => {
      await conn.update(config.table.ACTORS, actor);
      if (picture) {
        await conn.update(config.table.PICTURE, picture);
      }
      ctx.logger.info('[ActorService][updateActor] msg--> update table actor|picture');
      return {
        status: true,
      };
    }, ctx);
  }

  /**
   * 查询
   * @param {size, num, queryCase}params
   * @return {Promise<Promise<*|Promise<any>>|*>}
   */
  async getActors({ size, num, queryCase }) {
    const { ctx, app: { mysql }, config } = this;
    const pageSize = size || 10,
      pageNumber = num || 1;
    const offset = (pageNumber - 1) * pageSize;
    const countSql = `SELECT COUNT(1) FROM ${config.table.ACTORS}`;
    let sql = ctx.helper.selectColumns({
      table: config.table.ACTORS,
      mapColumns: [
        'id',
        'name',
        'introduce',
        'createAt',
        'updateAt',
        'pictureId',
      ],
    });
    if (ctx.helper.isEmpty(queryCase)) {
      sql += mysql._limit(+size, +offset);
      ctx.logger.debug('[ActorService][getActor] sql-->', sql);
      return await mysql.beginTransactionScope(async conn => {
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
    }
    queryCase = ctx.helper.modelToField(queryCase);
    sql += mysql._where(queryCase);
    ctx.logger.debug('[ActorService][getActor] sql-->', sql);
    return new Promise(async resolve => {
      const items = await mysql.query(sql);
      resolve({
        items,
      });
    });
  }
}


module.exports = ActorService;
