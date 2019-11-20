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
    const users = await userClient.query('select user.userId,user.password from from user where user.username = ?', [ username ]);
    if (users && users.length >= 0) {
      const userInfo = users[0];
      return {
        userId: userInfo.userId,
        password: userInfo.password,
      };
    }
    return {};
  }

};
