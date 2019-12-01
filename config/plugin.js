'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },

  validate: {
    enable: true,
    package: 'egg-validate',
  },

  // oauth2 service
  oAuth2Server: {
    enable: true,
    package: 'egg-oauth2-server',
  },

  email: {
    enable: true,
    package: 'egg-email',
  },
};
