'use strict';
const { Service } = require('egg');
let cacheTotal = 0;

class VideoService extends Service {

  async getVideo({ size, num, queryCase }) {
    const { ctx, app: { mysql }, config } = this;
    const pageSize = size || 10,
      pageNumber = num || 1;
    const offset = (pageNumber - 1) * pageSize;
    const countSql = `SELECT COUNT(1) FROM ${config.table.CONTENT}`;
    let sql = ctx.helper.selectColumns({
      table: config.table.CONTENT,
      mapColumns: [
        'id',
        'contentId',
        'contentName',
        'type',
        'contentType',
        'serialNumber',
        'rating',
        'title',
        'subTitle',
        'introduce',
        'createAt',
        'updateAt',
        'pictureId',
      ],
    });
    if (ctx.helper.isEmpty(queryCase)) {
      sql += mysql._limit(+size, +offset);
      ctx.logger.debug('[VideoService][getVideo] sql-->', sql);
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
  }

  /**
   *
   * @param params 参数
   * @return {Promise<void>}
   */
  async insertContent({ content, pictures, actors, definitions, genres }) {
    const { ctx, app: { mysql }, config } = this;
    let contentActorRelation = [],
      contentGenresRelation = [],
      contentDefinitionsRelation = [],
      contentPictureRelation = [];
    cacheTotal = null;
    const result = {
      status: false,
      insertContentId: '',
    };
    let contentId = null;
    if (content) {
      content.contentId = ctx.helper.randamStr();
      contentId = content.contentId;
      contentId = this.assignTime(contentId);
      ctx.logger.debug('[videoService] [insertContent] content-->', content);
    } else {
      ctx.logger.debug('[videoService] [insertContent] msg--> contents is empty');
      return new Promise(resolve => {
        resolve(result);
      });
    }
    // 由于actors 已经存储好，因此只需要进行关系表连接
    if (actors.length > 0) {
      contentActorRelation = actors.map(actor => {
        const item = {
          contentId,
          actors: actor.id,
          type: actor.type,
        };
        return this.assignTime(item);
      });
      contentActorRelation = ctx.helper.modelToFields(contentActorRelation);
      ctx.logger.debug('[videoService] [insertContent] contentActorRelation-->', contentActorRelation);
    }
    if (definitions.length > 0) {
      contentDefinitionsRelation = definitions.map(definition => {
        return this.assignTime({
          contentId,
          definitionId: definition.id,
        });
      });
      contentDefinitionsRelation = ctx.helper.modelToFields(contentDefinitionsRelation);
      ctx.logger.debug('[videoService] [insertContent] contentDefinitionsRelation-->', contentDefinitionsRelation);
    }
    if (genres.length > 0) {
      contentGenresRelation = genres.map(genre => {
        return this.assignTime({
          contentId,
          genresId: genre.id,
        });
      });
      contentGenresRelation = ctx.helper.modelToFields(contentGenresRelation);
      ctx.logger.debug('[videoService] [insertContent] contentGenresRelation-->', contentGenresRelation);
    }
    if (pictures.length > 0) {
      contentPictureRelation = pictures.map(pic => {
        return this.assignTime({
          contentId,
          picture: pic.id,
        });
      });
      contentPictureRelation = ctx.helper.modelToFields(contentPictureRelation);
      ctx.logger.debug('[videoService] [insertContent] contentPictureRelation-->', contentPictureRelation);
    }

    return await mysql.beginTransactionScope(async conn => {
      const contentResult = await conn.insert(config.table.CONTENT, content);
      if (contentResult.affectedRows <= 0) {
        ctx.logger.debug('[videoService] [insertContent] [msg]--> insert content fail');
        return {
          status: false,
        };
      }
      if (contentActorRelation.length > 0) {
        await conn.insert(config.table.CONTENT_ACTORS, contentActorRelation);
      }
      if (contentGenresRelation.length > 0) {
        await conn.insert(config.table.CONTENT_GENRES, contentGenresRelation);
      }
      if (contentDefinitionsRelation.length > 0) {
        await conn.insert(config.table.CONTENT_DEFINITION, contentDefinitionsRelation);
      }
      if (contentPictureRelation.length > 0) {
        await conn.insert(config.table.PICTURE_RELATION, contentPictureRelation);
      }
      return {
        status: true,
        contentInsertId: contentResult.insertId,
      };
    });
  }

  assignTime(object) {
    return Object.assign(object, {
      updateAt: this.app.mysql.literals.now,
      createAt: this.app.mysql.literals.now,
    });
  }
}

module.exports = VideoService;
