/**
 * 此配置文件为开发环境配置
 */
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

module.exports = appInfo => {
  const config = exports = {};
  config.keys = appInfo.name + '_1545141509031_3673';
  config.mysql = {
    clients,
  };

  config.logger = {
    level: 'DEBUG',
    // 打印所有级别日志到终端
    consoleLevel: 'DEBUG',
  };

  config.emailValidateUrl = {
    protocol: 'http://',
    hostname: '127.0.0.1',
    port: '7001',
  };
  return config;
};
