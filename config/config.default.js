/* eslint valid-jsdoc: "off" */

'use strict';

const databaseNames = [ 'moki_blog', 'moki_device', 'moki_user' ];
const clients = {};
databaseNames
  .map(dName => ({
  // host
    host: 'localhost',
    // 端口号
    port: '3306',
    // 用户名
    user: 'root',
    // 密码
    password: '12345678',
    // 数据库名
    database: dName,
  })).forEach(client => {
    clients[client.database] = client;
  });

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
  config.mysql = {
    clients,
  };
  // add your middleware config here
  config.middleware = [ 'errorHandler' ];
  config.errorHandler = {
    match: '/v1',
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    apiVersions: 'v1',
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
      enable: false,
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
