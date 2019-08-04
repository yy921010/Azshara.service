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
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.logger = {
    level: 'DEBUG',
    // 生产环境打印info级别日志
    allowDebugAtProd: true,
  };

  config.upload = {
    baseDir: 'app/public/',
    imageService: '127.0.0.1:7001/public/',
    media: 'media',
  };

  config.security = {
    csrf: {
      headerName: 'x-csrf-token',
    },
  };

  config.multipart = {
    fileExtensions: [ '' ],
  };

  return {
    ...config,
    ...userConfig,
  };
};
