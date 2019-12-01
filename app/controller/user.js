'use strict';
const Controller = require('./base_controller');
const { userAddFail, userEmailIsExist, userHasExist, userValidateFailed, emailValidateFailed } = require('./error_code');

const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;
const USER_PASS_REGEXP = /^([^:]*):(.*)$/;

module.exports = class UserController extends Controller {
  /**
   * 添加注释
   * @return {Promise<void>}
   */
  async userRegister() {
    const { ctx } = this;
    const userInfo = ctx.request.body;
    ctx.validate({
      username: 'string',
      nickName: 'string',
      email: 'email',
      password: {
        type: 'password',
        max: 30,
        min: 8,
      },
    }, userInfo);
    const userExist = await ctx.service.user.getUserByUsername(userInfo.username);
    const emailInfo = await ctx.service.email.getEmailByName(userInfo.email);
    if (ctx.helper.isEmpty(userExist) && ctx.helper.isEmpty(emailInfo)) {
      const addResult = await ctx.service.user.addUser(
        {
          username: userInfo.username,
          nickName: userInfo.nickName,
          password: userInfo.password,
        },
        {
          name: userInfo.email,
        });
      addResult.status ? this.success('用户注册成功') : this.fail('用户注册失败', userAddFail);
    } else {
      if (userExist) {
        this.fail('用户已经注册', userHasExist);
      }
      if (emailInfo) {
        this.fail('邮箱已经绑定', userEmailIsExist);
      }
    }
  }


  async changePassword() {
    const { ctx } = this;
    const userInfo = ctx.request.body;
    ctx.validate({
      username: 'string',
      email: 'email',
    }, userInfo);
    const userExist = await ctx.service.user.getUserByUsername(userInfo.username);
    const emailInfo = await ctx.service.email.getEmailByName(userInfo.email);
    if (!ctx.helper.isEmpty(userExist) && !ctx.helper.isEmpty(emailInfo)) {
      const userId = userExist.userId;
      const validateCode = Math.random().toString().slice(-6) + '';
      await ctx.service.email.updateEmailValidateCode({ validateCode, userId });
      ctx.helper.sendMail({
        from: '805841483@qq.com',
        to: userInfo.email,
        subject: '注册成功',
        html: `validateCode ${validateCode}`,
      });
      this.success('请进入邮箱收取验证码');
    } else {
      this.fail('验证失败', userValidateFailed);
    }
  }

  /**
   * 改变密码完成
   * @return {Promise<void>}
   */
  async changePasswordFinish() {
    const { ctx } = this;
    const changeInfo = ctx.request.body;
    ctx.validate({
      username: 'string',
      password: 'password',
      email: 'email',
      validateCode: 'string',
    });
    const userExist = await ctx.service.user.getUserByUsername(changeInfo.username);
    const emailInfo = await ctx.service.email.getEmailByName(changeInfo.email);

    if (ctx.helper.isEmpty(userExist)) {
      this.fail('用户不存在', userValidateFailed);
      return;
    }

    if (emailInfo.validateCode !== changeInfo.validateCode) {
      this.fail('验证码不正确', emailValidateFailed);
      return;
    }
    const result = await ctx.service.user.updateUserPass(changeInfo.username, changeInfo.password, userExist.userId);
    if (result.status) {
      await ctx.service.email.updateEmailValidateCode({ validateCode: '', userId: userExist.userId });
    }
    this.success('修改完成');

  }

  /**
   * 注销登陆
  */
  async revokeToken() {
    const { ctx } = this;
    ctx.validate({
      authorization: 'string',
    }, ctx.request.header);
    const clientInfoBasic64 = ctx.request.header.authorization;
    if (typeof clientInfoBasic64 !== 'string') {
      this.ctx.throw(401, 'authorization is not string');
      return;
    }
    // parse header
    const match = CREDENTIALS_REGEXP.exec(clientInfoBasic64);
    if (!match) {
      this.ctx.throw(401, 'authorization type is wrong');
      return;
    }
    // decode user pass
    const userPass = USER_PASS_REGEXP.exec(ctx.helper.decodeBase64(match[1]));
    const clientId = userPass[1];
    const clientSecret = userPass[2];
    const deviceInfo = await ctx.service.device.getDeviceInfoByDeviceId(clientId);
    if (this.ctx.helper.isEmpty(deviceInfo) || clientSecret !== deviceInfo.deviceSecret) {
      ctx.logger.warn('[user][revokeToken] msg-->client has not registered!!');
      return;
    }
    ctx.validate({
      access_token: 'string',
    }, ctx.request.body);
    const accessToken = ctx.request.body.access_token;
    ctx.helper.deleteToken4TokenStr(accessToken);
    this.success('注销成功');
  }
};
