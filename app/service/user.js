'use strict';

const Service = require('egg').Service;
const uuidv1 = require('uuid/v1');

module.exports = class UserService extends Service {

  async getUserByUsername(username) {
    const { ctx, app: { mysql } } = this;
    const userInfo = {};
    ctx.logger.debug('[UserService] [authoriseUserPass] msg-->enter');
    if (!username) {
      ctx.logger.warn('[UserService] [authoriseUserPass] msg-->username is empty');
      return new Promise(resolve => resolve(userInfo));
    }
    const userClient = mysql.get('moki_user');
    const users = await userClient.query('select user.userId,user.password from from user where user.username = ?', [ username ]);
    if (users && users.length >= 0) {
      const _userInfo = users[0];
      userInfo.userId = _userInfo.userId;
      userInfo.password = _userInfo.password;
    }
    return userInfo;
  }
  // todo: 需要添加邮箱数据库
  async addUser(userInfo = {}) {
    const { ctx, app: { mysql } } = this;
    const finalResult = {};
    if (ctx.helper.isEmpty(userInfo)) {
      ctx.logger.warn('[UserService] [addUser] msg-->userInfo is empty');
      finalResult.status = false;
    } else {
      const userClient = mysql.get('moki_user');
      userInfo.userId = 'moki_uid+' + ctx.helper.cryptoMd5(userInfo.userName);
      const _passwordSalt = userInfo.userId + uuidv1() + userInfo.password;
      userInfo.password = ctx.helper.cryptoMd5(userInfo.password, _passwordSalt);
      userInfo.updateTime = userClient.literals.now;
      userInfo.createdTime = userClient.literals.now;
      const result = await userClient.insert('user', userInfo);
      if (result.affectedRows === 1) {
        finalResult.status = true;
        finalResult.actorInsertId = result.insertId;
      }
    }
    return finalResult;
  }

};
