'use strict';
const { Service } = require('egg');
let cacheTotal = 0;

class VideoService extends Service {

  async find({ size, num, queryCase }) {
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
  async add({ content, pictures, actors, definitions, genres }) {
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
    if (!ctx.helper.isEmpty(content)) {
      content.contentId = ctx.helper.randamStr();
      contentId = content.contentId;
      contentId = this.assignTime(contentId);
      content = ctx.helper.modelToField(content);
      ctx.logger.debug('[videoService] [add] content-->', content);
    } else {
      ctx.logger.debug('[videoService] [add] msg--> contents is empty');
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
      ctx.logger.debug('[videoService] [add] contentActorRelation-->', contentActorRelation);
    }
    if (definitions.length > 0) {
      contentDefinitionsRelation = definitions.map(definition => {
        return this.assignTime({
          contentId,
          definitionId: definition.id,
        });
      });
      contentDefinitionsRelation = ctx.helper.modelToFields(contentDefinitionsRelation);
      ctx.logger.debug('[videoService] [add] contentDefinitionsRelation-->', contentDefinitionsRelation);
    }
    if (genres.length > 0) {
      contentGenresRelation = genres.map(genre => {
        return this.assignTime({
          contentId,
          genresId: genre.id,
        });
      });
      contentGenresRelation = ctx.helper.modelToFields(contentGenresRelation);
      ctx.logger.debug('[videoService] [add] contentGenresRelation-->', contentGenresRelation);
    }
    if (pictures.length > 0) {
      contentPictureRelation = pictures.map(pic => {
        return this.assignTime({
          mainId: contentId,
          pictureId: pic.id,
        });
      });
      contentPictureRelation = ctx.helper.modelToFields(contentPictureRelation);
      ctx.logger.debug('[videoService] [add] contentPictureRelation-->', contentPictureRelation);
    }

    return await mysql.beginTransactionScope(async conn => {
      const contentResult = await conn.insert(config.table.CONTENT, content);
      if (contentResult.affectedRows <= 0) {
        ctx.logger.debug('[videoService] [add] [msg]--> insert content fail');
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

  async update({ content, pictures, actors, definitions, genres }) {
    const { ctx, app: { mysql }, config } = this;
    const result = {
      status: false,
    };
    if (!ctx.helper.isEmpty(content)) {
      content.updateAt = mysql.literals.now;
      content = ctx.helper.modelToField(content, true);
    } else {
      return new Promise(resolve => resolve(result));
    }
    ctx.logger.debug('[videoService] [update] content-->', content);

    if (pictures.length > 0) {

      pictures = pictures.map(pic => ({
        updateAt: mysql.literals.now,
        pictureId: pic.id,
      }));
      pictures = ctx.helper.modelToFields(pictures);
      ctx.logger.debug('[videoService] [update] pictures-->', pictures);
    }

    if (actors.length > 0) {
      actors = actors.map(genre => ({
        updateAt: mysql.literals.now,
        genresId: genre.id,
      }));
      actors = ctx.helper.modelToFields(actors);
      ctx.logger.debug('[videoService] [update] actors-->', pictures);
    }

    if (definitions.length > 0) {
      definitions = definitions.map(definition => ({
        updateAt: mysql.literals.now,
        definitionId: definition.id,
      }));
      definitions = ctx.helper.modelToFields(definitions);
      ctx.logger.debug('[videoService] [update] definitions-->', definitions);
    }

    if (genres.length > 0) {
      genres = genres.map(genres => ({
        updateAt: mysql.literals.now,
        genresId: genres.id,
      }));
      genres = ctx.helper.genres(genres);
      ctx.logger.debug('[videoService] [update] genres-->', genres);
    }


    return await mysql.beginTransactionScope(async conn => {
      const contentResult = await conn.update(config.table.CONTENT, content);
      if (contentResult.affectedRows <= 0) {
        ctx.logger.debug('[videoService] [update] [msg]--> update content fail');
        return {
          status: false,
        };
      }

      if (genres.length > 0) {
        await conn.update(config.table.CONTENT_GENRES, genres);
      }
      if (definitions.length > 0) {
        await conn.update(config.table.CONTENT_DEFINITION, definitions);
      }
      if (actors.length > 0) {
        await conn.update(config.table.CONTENT_ACTORS, actors);
      }
      if (pictures.length > 0) {
        await conn.update(config.table.PICTURE_RELATION, pictures);
      }

      return {
        status: true,
      };

    });
  }

  async delete(id) {
    // 先查询关联的contentId
  }

  assignTime(object) {
    return Object.assign(object, {
      updateAt: this.app.mysql.literals.now,
      createAt: this.app.mysql.literals.now,
    });
  }
}

module.exports = VideoService;
