/* eslint valid-jsdoc: "off" */

'use strict';
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1562769362441_5869';
  // add your middleware config here
  config.middleware = [ 'errorHandler' ];
  config.errorHandler = {
    match: '/v1',
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    apiVersions: 'v1',
    // 00: 代表业务
    // 00: 状态
    errorCode: {
      UPDATE_FAIL: '0101',
      CREATED_FAIL: '0201',
    },
  };

  config.upload = {
    baseDir: 'app/public/',
    imageService: '127.0.0.1:7001/public/',
    media: 'media',
  };

  config.security = {
    csrf: {
      headerName: 'x-csrf-token',
      enable: false,
    },
  };

  config.multipart = {
    fileExtensions: [ '' ],
  };

  config.Auth2Server = {
    debug: config.env === 'local',
    grants: [ 'password', 'refresh_token' ],
  };

  return {
    ...config,
    ...userConfig,
  };
};
