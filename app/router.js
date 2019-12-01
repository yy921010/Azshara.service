'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.prefix('/v1');
  router.get('/', controller.home.index);
  // device router
  router.post('/device', controller.device.addDevice);
  router.put('/device', controller.device.updateDevice);
  router.delete('/device', app.oAuth2Server.authenticate(), controller.device.deleteDevice);


  router.post('/change-pass', controller.user.changePassword);
  router.post('/pass-finish', controller.user.changePasswordFinish);
  // 邮箱验证
  router.get('/email-validate', controller.email.emailValidate);
  router.post('/user-register', controller.user.userRegister);

  // 登录操作，获得token
  router.post('/oauth2/token', app.oAuth2Server.token());
  router.post('/oauth2/revoke-token', controller.user.revokeToken);
};
