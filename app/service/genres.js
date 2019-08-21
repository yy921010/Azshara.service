'use strict';
const { Service } = require('egg');
class GenresService extends Service {

  async add(genres) {
    const { app: { mysql }, ctx, config } = this;
    if (genres.length === 0) {
      ctx.logger.debug('[GenresService] [insertGenres] enter');
      return new Promise(resolve => {
        resolve({
          status: false,
        });
      });
    }
    genres = genres.map(item => {
      const result = Object.assign(item, {
        updateAt: mysql.literals.now,
        createAt: mysql.literals.now,
      });
      return ctx.helper.modelToField(result);
    });
    ctx.logger.debug('[GenresService] [add] genres', genres);
    const insertResult = await mysql.insert(config.table.GENRES, genres);
    return {
      status: insertResult.affectedRows >= 1,
    };
  }

  async update(genres) {
    const { app: { mysql }, ctx, config } = this;
    if (ctx.helper.isEmpty(genres)) {
      return new Promise(resolve => {
        resolve({
          status: false,
        });
      });
    }
    genres.updateAt = mysql.literals.now;
    genres = ctx.helper.modelToField(genres, true);
    ctx.logger.debug('[GenresService] [update] genres', genres);
    const updateResult = await mysql.update(config.table.GENRES, genres);
    return {
      status: updateResult.affectedRows === 1,
    };
  }


  async delete(genresId) {
    const { ctx, app: { mysql }, config } = this;
    if (!genresId) {
      return new Promise(resolve => {
        resolve({
          status: false,
        });
      });
    }
    const deleteResult = await mysql.delete(config.table.GENRES, {
      ID: genresId,
    });
    ctx.logger.debug('[GenresService] [delete] result', deleteResult);
    return {
      status: deleteResult.affectedRows === 1,
    };
  }
}
module.exports = GenresService;
