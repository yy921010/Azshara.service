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
        'publishDate',
        'duration',
        'language',
        'country',
        'createAt',
        'updateAt',
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
  async add({ content, pictureIds, actors, definitionIds, genreId }) {
    const { ctx, app: { mysql }, config } = this;
    let contentActorRelation = [],
      contentGenresRelation,
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
      content = this.assignTime(content);
      content = ctx.helper.modelToField(content);
      ctx.logger.debug('[videoService] [add] content-->', content);
    } else {
      ctx.logger.debug('[videoService] [add] msg--> contents is empty');
      return new Promise(resolve => {
        resolve(result);
      });
    }
    // 由于actors 已经存储好，因此只需要进行关系表连接
    if (actors && actors.length > 0) {
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
    if (definitionIds && definitionIds.length > 0) {
      contentDefinitionsRelation = definitionIds.map(definitionId => {
        return this.assignTime({
          contentId,
          definitionId,
        });
      });
      contentDefinitionsRelation = ctx.helper.modelToFields(contentDefinitionsRelation);
      ctx.logger.debug('[videoService] [add] contentDefinitionsRelation-->', contentDefinitionsRelation);
    }

    if (genreId) {
      contentGenresRelation = ctx.helper.modelToField({
        contentId,
        genresId: genreId,
        updateAt: mysql.literals.now,
        createAt: mysql.literals.now,
      });
      ctx.logger.debug('[videoService] [add] contentGenresRelation-->', contentGenresRelation);
    }

    if (pictureIds && pictureIds.length > 0) {
      contentPictureRelation = pictureIds.map(pictureId => {
        return this.assignTime({
          mainId: contentId,
          pictureId,
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
      if (!ctx.helper.isEmpty(contentGenresRelation)) {
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


  /**
   * TODO: 未进行单元测试
   * @param params
   * @return {Promise<*|Promise<Promise<any>|*>>}
   */
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

    if (pictures && pictures.length > 0) {
      pictures = pictures.map(pic => ({
        updateAt: mysql.literals.now,
        pictureId: pic.id,
      }));
      pictures = ctx.helper.modelToFields(pictures);
      ctx.logger.debug('[videoService] [update] pictures-->', pictures);
    }

    if (actors && actors.length > 0) {
      actors = actors.map(genre => ({
        updateAt: mysql.literals.now,
        genresId: genre.id,
      }));
      actors = ctx.helper.modelToFields(actors);
      ctx.logger.debug('[videoService] [update] actors-->', pictures);
    }

    if (definitions && definitions.length > 0) {
      definitions = definitions.map(definition => ({
        updateAt: mysql.literals.now,
        definitionId: definition.id,
      }));
      definitions = ctx.helper.modelToFields(definitions);
      ctx.logger.debug('[videoService] [update] definitions-->', definitions);
    }

    if (genres && genres.length > 0) {
      genres = genres.map(genres => ({
        updateAt: mysql.literals.now,
        genresId: genres.id,
      }));
      genres = ctx.helper.genres(genres);
      ctx.logger.debug('[videoService] [update] genres-->', genres);
    }


    return await mysql.beginTransactionScope(async conn => {
      const contentResult = await conn.update(config.table.CONTENT, content);
      if (contentResult.affectedRows === 0) {
        ctx.logger.debug('[videoService] [update] [msg]--> update content fail');
        return {
          status: false,
        };
      }

      if (genres && genres.length > 0) {
        await conn.update(config.table.CONTENT_GENRES, genres, {
          where: {
            CONTENT_ID: content.CONTENT_ID,
          },
        });
      }
      if (definitions && definitions.length > 0) {
        await conn.update(config.table.CONTENT_DEFINITION, definitions, {
          where: {
            CONTENT_ID: content.CONTENT_ID,
          },
        });
      }
      if (actors && actors.length > 0) {
        await conn.update(config.table.CONTENT_ACTORS, actors, {
          where: {
            CONTENT_ID: content.CONTENT_ID,
          },
        });
      }
      if (pictures && pictures.length > 0) {
        await conn.update(config.table.PICTURE_RELATION, pictures, {
          where: {
            MAIN_ID: content.CONTENT_ID,
          },
        });
      }

      return {
        status: true,
      };

    });
  }

  async delete(id) {
    // 先查询关联的contentId
    const { ctx, app: { mysql }, config } = this;
    let getContentIdSql = ctx.helper.selectColumns({
      table: config.table.CONTENT,
      mapColumns: [
        'contentId',
      ],
    });

    getContentIdSql += mysql._where({
      ID: id,
    });
    ctx.logger.debug('[videoService][delete] sql-->', getContentIdSql);
    return await mysql.beginTransactionScope(async conn => {
      const selectContentIds = await conn.query(getContentIdSql);
      if (selectContentIds && selectContentIds.length > 0) {
        ctx.logger.debug('[videoService][delete] selectContentIds-->', selectContentIds[0].contentId);
        const contentId = selectContentIds[0].contentId;
        const deleteCase = ctx.helper.modelToField({
          contentId,
        });

        const deleteDefinitionSql = `DELETE FROM ${config.table.DEFINITION} 
        WHERE ID IN (SELECT DEFINITION_ID FROM ${config.table.CONTENT_DEFINITION} WHERE CONTENT_ID=${mysql.escape(contentId)})`;
        await conn.query(deleteDefinitionSql);

        const deletePictureSql = `DELETE FROM ${config.table.PICTURE} 
        WHERE ID IN (SELECT PICTURE_ID FROM ${config.table.PICTURE_RELATION} WHERE MAIN_ID=${mysql.escape(contentId)})`;
        await conn.query(deletePictureSql);

        ctx.logger.debug('[ActorService][delete] msg-->', 'delete contentActors');
        await conn.delete(config.table.CONTENT_ACTORS, deleteCase);

        ctx.logger.debug('[ActorService][delete] msg-->', 'delete contentDefinition');
        await conn.delete(config.table.CONTENT_DEFINITION, deleteCase);

        ctx.logger.debug('[ActorService][delete] msg-->', 'delete contentGenres');
        await conn.delete(config.table.CONTENT_GENRES, deleteCase);

        await conn.delete(config.table.PICTURE_RELATION, {
          MAIN_ID: contentId,
        });

        await conn.delete(config.table.CONTENT, {
          ID: id,
        });

        return {
          status: true,
        };

      }
      ctx.logger.info('[ActorService][delete] msg-->', 'selectContentIds is empty');
      return {
        status: false,
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
