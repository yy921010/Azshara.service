'use strict';
const { Service } = require('egg');
class DefinitionService extends Service {

  async add(definitions) {
    const { app: { mysql }, ctx, config } = this;
    if (definitions.length === 0) {
      ctx.logger.debug('[DefinitionService] [insertDefinition] enter');
      return new Promise(resolve => {
        resolve({
          status: false,
        });
      });
    }
    definitions = definitions.map(item => {
      const result = Object.assign(item, {
        updateAt: mysql.literals.now,
        createAt: mysql.literals.now,
      });
      return ctx.helper.modelToField(result);
    });
    ctx.logger.debug('[DefinitionService] [add] definition', definitions);
    const insertResult = await mysql.insert(config.table.DEFINITION, definitions);
    return {
      status: insertResult.affectedRows >= 1,
    };
  }

  async update(definition) {
    const { app: { mysql }, ctx, config } = this;
    if (ctx.helper.isEmpty(definition)) {
      return new Promise(resolve => {
        resolve({
          status: false,
        });
      });
    }
    definition.updateAt = mysql.literals.now;
    definition = ctx.helper.modelToField(definition, true);
    ctx.logger.debug('[DefinitionService] [update] definition', definition);
    const updateResult = await mysql.update(config.table.DEFINITION, definition);
    return {
      status: updateResult.affectedRows === 1,
    };
  }

  async delete(definitionId) {
    const { ctx, app: { mysql }, config } = this;
    if (!definitionId) {
      return new Promise(resolve => {
        resolve({
          status: false,
        });
      });
    }
    const deleteResult = await mysql.delete(config.table.DEFINITION, {
      ID: definitionId,
    });
    ctx.logger.debug('[DefinitionService] [delete] result', deleteResult);
    return {
      status: deleteResult.affectedRows === 1,
    };
  }
}

module.exports = DefinitionService;
