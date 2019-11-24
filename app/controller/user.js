'use strict';
const Controller = require('./base_controller');
const { USER_ADD_FAIL } = require('./error_code');

module.exports = class UserController extends Controller {

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
      addResult.status ? this.success('用户注册成功') : this.success('用户注册失败', USER_ADD_FAIL);
    } else {
      if (userExist) {
        this.success('用户已经注册成功');
      }
      if (emailInfo) {
        this.success('邮箱已经绑定');
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
      this.success('验证失败');
    }
  }
};
