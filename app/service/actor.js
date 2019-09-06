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
    ctx.logger.debug('[ActorService][insertActor] [mgs]--> enter');
    cacheTotal = null;
    let pictureRelationField = {};
    actor.createAt = mysql.literals.now;
    actor.updateAt = mysql.literals.now;
    if (picture.id) {
      actor.pictureId = ctx.helper.randamStr();
      pictureRelationField = ctx.helper.modelToField({
        pictureId: picture.id,
        mainId: actor.pictureId,
        updateAt: mysql.literals.now,
        createAt: mysql.literals.now,
      });
    }
    ctx.logger.debug('[ActorService][insertActor] pictureRelationField-->', pictureRelationField);
    const actorField = ctx.helper.modelToField(actor);
    const finalResult = {
      status: false,
      actorInsertId: '',
    };
    ctx.logger.debug('[ActorService][insertActor] actorField-->', actorField);
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
  async deleteActor(actorId) {
    const { ctx, app: { mysql }, config } = this;
    ctx.logger.debug('[ActorService][deleteActor] [mgs]--> enter');
    cacheTotal = null;
    if (!actorId) {
      return new Promise(resolve => {
        ctx.logger.error('[ActorService][deleteActor] msg--> actorId is empty');
        resolve({
          status: false,
        });
      });
    }
    let queryActorSql = ctx.helper.selectColumns({
      table: config.table.ACTORS,
      mapColumns: [
        'pictureId',
      ],
    });
    queryActorSql += mysql._where({
      ID: actorId,
    });
    ctx.logger.debug('[ActorService][deleteActor] queryActorSql-->', queryActorSql);
    return await mysql.beginTransactionScope(async conn => {
      const resultActors = await conn.query(queryActorSql);
      if (resultActors.length === 1) {
        const pictureId = resultActors[0].pictureId;
        const sql = `DELETE FROM ${config.table.PICTURE} WHERE ID IN 
        (SELECT PICTURE_ID FROM ${config.table.PICTURE_RELATION}  WHERE MAIN_ID = ${mysql.escape(pictureId)})`;
        ctx.logger.debug('[ActorService][deleteActor] deletePictureSql-->', sql);
        await conn.query(sql);
        await conn.delete(config.table.PICTURE_RELATION, {
          MAIN_ID: pictureId,
        });
      }

      await conn.delete(config.table.ACTORS, {
        ID: actorId,
      });

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
  async updateActor({ actor, pictureId }) {
    const { ctx, app: { mysql }, config } = this;
    ctx.logger.debug('[ActorService][updateActor] [mgs]--> enter');
    actor.updateAt = mysql.literals.now;
    cacheTotal = null;
    let pictureRelationField;
    if (pictureId) {
      actor.pictureId = ctx.helper.randamStr();
      pictureRelationField = ctx.helper.modelToField({
        pictureId,
        mainId: actor.pictureId,
        updateAt: mysql.literals.now,
        createAt: mysql.literals.now,
      });
    }

    actor = ctx.helper.modelToField(actor, true);
    ctx.logger.debug('[ActorService][updateActor] actor-->', actor);
    ctx.logger.debug('[ActorService][updateActor] pictureRelationField-->', pictureRelationField);
    return await mysql.beginTransactionScope(async conn => {
      await conn.update(config.table.ACTORS, actor);
      if (pictureId) {
        await conn.insert(config.table.PICTURE_RELATION, pictureRelationField);
      }
      ctx.logger.info('[ActorService][updateActor] msg--> update table actor | picture');
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
    ctx.logger.debug('[ActorService][getActors] [msg]--> enter');
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
