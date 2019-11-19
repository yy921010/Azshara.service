'use strict';

const Service = require('egg').Service;

module.exports = class UserService extends Service {

  async getUserByUsername(username) {
    const { ctx, app: { mysql } } = this;
    ctx.logger.debug('[UserService] [authoriseUserPass] msg-->enter');
    if (!username) {
      ctx.logger.warn('[UserService] [authoriseUserPass] msg-->username is empty');
      return {};
    }
    const userClient = mysql.get('moki_user');
    const users = await userClient.query('select user.userid,user.password from from user where user.username = ?', [ username ]);
    if (users && users.length >= 0) {
      return {
        userId: users[0].userid,
        password: users[0].password,
      };
    }
    return {};
  }

};
