'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/image', controller.image.index);
  router.delete('/image', controller.image.deleteImage);
  router.resources('actor', `/${app.config.apiVersions}/actor`, controller.actor);
  router.resources('video', `/${app.config.apiVersions}/video`, controller.video);
};
