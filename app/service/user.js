'use strict';

const Service = require('egg').Service;
const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs');

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
    const _userInfo = await userClient.get('user', {
      username,
    });
    if (_userInfo) {
      userInfo.userId = _userInfo.userId;
      userInfo.password = _userInfo.password;
    }
    return userInfo;
  }

  /**
   * 添加用户
   * @param userInfo
   * @param userEmail
   * @return {Promise<unknown>}
   */
  async addUser(userInfo = {}, userEmail = {}) {
    const { ctx, app: { mysql } } = this;
    const finalResult = {};
    finalResult.status = false;
    if (ctx.helper.isEmpty(userInfo) || this.ctx.helper.isEmpty(userEmail)) {
      ctx.logger.warn('[UserService] [addUser] msg-->userInfo or userEmail is empty');
      return new Promise(resolve => resolve(finalResult));
    }
    const userClient = mysql.get('moki_user');
    userInfo.userId = 'moki_uid+' + ctx.helper.cryptoMd5(userInfo.userName);
    const _passwordSalt = userInfo.userId + uuidv1() + userInfo.password;
    userInfo.password = ctx.helper.cryptoMd5(userInfo.password, _passwordSalt);
    userInfo.updateTime = userClient.literals.now;
    userInfo.createdTime = userClient.literals.now;

    return userClient.beginTransactionScope(async conn => {
      const mailResult = await this.addMail(userInfo.userId, userEmail);
      const result = await conn.insert('user', userInfo);
      if (result.affectedRows === 1) {
        ctx.logger.debug('[UserService] [addUser] msg--> user add success');
        finalResult.status = mailResult.status;
        finalResult.id = result.insertId;
        const targetUrl = this.makeRedirectUrl(userInfo.userId, userEmail.validateCode);
        const html = await this.readEmailTemplate(targetUrl);
        await ctx.helper.sendMail({
          from: '805841483@qq.com',
          to: userEmail.name,
          subject: '邮箱验证',
          html,
        });
      }
      return finalResult;
    }, ctx);
  }

  async readEmailTemplate(targetUrl) {
    const file = path.resolve(this.config.baseDir, 'app/public/html/email-register.html');
    const template = await fs.readFileSync(file);
    const templateStr = template.toString();
    return templateStr.replace(/\{\{(.+?)\}\}/g, targetUrl);
  }

  makeRedirectUrl(userId, validateCode) {
    const { ctx, config } = this;
    const iv = Buffer.from(config.mailCodeIV, 'utf-8');
    const key = Buffer.from(config.mailCodeKey, 'utf-8');
    const decUserId = ctx.helper.aesEncrypt(userId, key, iv);
    const decCode = ctx.helper.aesEncrypt(validateCode, key, iv);
    return `http://${ctx.request.hostname}:7001/emailValidate?userId=${decUserId}&validateCode=${decCode}`;
  }


  /**
   * 添加邮箱
   * @param userId
   * @param userEmail
   * @return {Promise<unknown>}
   */
  async addMail(userId = '', userEmail = {}) {
    const finalResult = {};
    finalResult.status = false;
    if (!userId || this.ctx.helper.isEmpty(userEmail)) {
      this.ctx.logger.warn('[UserService] [addMail] msg-->userId or userInfo is empty');
      return new Promise(resolve => resolve(finalResult));
    }
    const { ctx, app: { mysql } } = this;
    const userDataBase = mysql.get('moki_user');
    userEmail.updateTime = userDataBase.literals.now;
    userEmail.createdTime = userDataBase.literals.now;
    userEmail.userId = userId;
    userEmail.validateCode = Math.random().toString().slice(-6) + '';
    return userDataBase.beginTransactionScope(async conn => {
      const result = await conn.insert('mail', userEmail);
      if (result.affectedRows === 1) {
        finalResult.status = true;
        finalResult.emailId = result.insertId;
      }
      return finalResult;
    }, ctx);
  }
};
