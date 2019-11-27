'use strict';
const Controller = require('./base_controller');
const { userAddFail, userEmailIsExist, userHasExist, userValidateFailed } = require('./error_code');

module.exports = class UserController extends Controller {
  /**
   * 添加注释
   * @returns {Promise<void>}
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
};
