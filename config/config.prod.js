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
    level: 'INFO',
  };

  config.emailValidateUrl = {
    protocol: 'https://',
    hostname: 'api.tomokotv.com',
    port: '',
  };
  return config;
};
