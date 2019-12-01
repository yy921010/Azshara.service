'use strict';
const Controller = require('./base_controller');
const { emailValidateFailed } = require('./error_code');
module.exports = class EmailController extends Controller {

  async emailValidate() {
    const { ctx, config } = this;
    const queryOpts = ctx.request.query;
    ctx.validate({
      userId: 'string',
      validateCode: 'string',
    }, queryOpts);
    const userId = ctx.helper.aesDecrypt(queryOpts.userId, config.mailCodeKey, config.mailCodeIV);
    const validateCode = ctx.helper.aesDecrypt(queryOpts.validateCode, config.mailCodeKey, config.mailCodeIV);
    const result = await ctx.service.email.validateEmail({ userId, validateCode });
    if (result.status) {
      await ctx.service.email.updateEmailValidateCode({
        validateCode: '',
        userId,
      });
    }
    result.status ? this.success('验证成功') : this.fail('验证失败', emailValidateFailed);
  }


  async validateMailPost() {
    const { ctx } = this;
    const queryOpts = ctx.request.body;
    ctx.validate({
      userId: 'string',
      validateCode: 'string',
    }, queryOpts);
    const result = await ctx.service.email.validateEmail({
      userId: queryOpts.userId,
      validateCode: queryOpts.validateCode,
    });
    result.status ? this.success('验证成功') : this.fail('验证失败', emailValidateFailed);
  }
};
