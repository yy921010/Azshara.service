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
  router.delete('/device', controller.device.deleteDevice);

  router.post('/userRegister', controller.user.userRegister);
  router.get('/emailValidate', controller.email.emailValidate);

  // 登录操作，获得token
  router.post('/oauth2/token', app.oAuth2Server.token());
};
