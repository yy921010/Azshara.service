'use strict';

const { Service } = require('egg');
module.exports = class EmailService extends Service {
  /**
     * 用来更新验证邮箱的状态
     * @param emailInfo
     * @return {Promise<unknown>}
     */
  async validateEmail(emailInfo) {
    const { ctx, app: { mysql } } = this;
    ctx.logger.debug('[EmailService] [validateEmail] emailInfo', emailInfo);
    const finalResult = {};
    finalResult.status = false;
    if (ctx.helper.isEmpty(emailInfo)) {
      return new Promise(resolve => resolve(finalResult));
    }
    const userDataBase = mysql.get('moki_user');
    const mailTransaction = await userDataBase.beginTransaction();

    try {
      const getCurEmail = await mailTransaction.get('mail', {
        userId: emailInfo.userId,
      });
      if (getCurEmail && getCurEmail.validateCode === emailInfo.validateCode) {
        await mailTransaction.update('mail', {
          id: getCurEmail.id,
          isValidate: 1,
        });
        await mailTransaction.commit();
        ctx.logger.debug('[EmailService] [validateEmail] 邮箱信息： 验证成功');
        finalResult.status = true;
      } else {
        await mailTransaction.rollback();
        ctx.logger.debug('[EmailService] [validateEmail] 邮箱信息： 验证失败');
      }
    } catch (e) {
      ctx.logger.warn('[EmailService] [validateEmail] errormsg', e);
      await mailTransaction.rollback();
    }
    return new Promise(resolve => resolve(finalResult));
  }

  async getEmailByName(emailName) {
    const { ctx, app: { mysql } } = this;
    if (!emailName) {
      ctx.logger.debug('[EmailService] [getEmailByName] empty opts');
      return new Promise(resolve => resolve({}));
    }
    const userDatabase = mysql.get('moki_user');
    return await userDatabase.get('mail', {
      name: emailName,
    });
  }


  async getEmailByUserId(userId = '') {
    const { ctx, app: { mysql } } = this;
    if (!userId) {
      ctx.logger.debug('[EmailService] [getEmailByUserId] empty');
      return new Promise(resolve => resolve({}));
    }
    const userDatabase = mysql.get('moki_user');
    return await userDatabase.get('mail', {
      userId,
    });
  }

  /**
   * 更新邮箱
   * @param validateCode
   * @param userId
   * @return {Promise<unknown>}
   */
  async updateEmailValidateCode({ validateCode, userId }) {
    const { app: { mysql } } = this;
    const finalResult = {};
    finalResult.status = false;
    if (!userId) {
      return new Promise(resolve => resolve(finalResult));
    }
    const userDataBase = mysql.get('moki_user');
    const result = await userDataBase.update('mail', {
      updateTime: userDataBase.literals.now,
      validateCode,
    }, {
      where: {
        userId,
      },
    });
    finalResult.status = result.affectedRows === 1;
    return finalResult;
  }
};
