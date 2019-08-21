/**
 * 此配置文件为开发环境配置
 */

'use strict';
module.exports = appInfo => {
  const config = exports = {};
  config.keys = appInfo.name + '_1545141509031_3673';
  config.mysql = {
    // 单数据库信息配置
    client: {
    // host
      host: 'localhost',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: '123456',
      // 数据库名
      database: 'azshara',
    },
  };
  config.table = {
    ACTORS: 'tf_b_actors',
    CONTENT: 'tf_b_content',
    CONTENT_ACTORS: 'tf_b_content_actors_relation',
    CONTENT_DEFINITION: 'tf_b_content_definition_relation',
    CONTENT_GENRES: 'tf_b_content_genres_relation',
    DEFINITION: 'tf_b_definition',
    FLOOR: 'tf_b_floor',
    FLOOR_CONTENT: 'tf_b_floor_content_relation',
    GENRES: 'tf_b_genres',
    NAVIGATOR: 'tf_b_navigate',
    PAGE_FLOOR: 'tf_b_page_floor_relation',
    PAGE_INFO: 'tf_b_page_info',
    PICTURE: 'tf_b_picture',
    PICTURE_RELATION: 'tf_b_picture_relation',
  };

  config.logger = {
    level: 'DEBUG',
  };
  return config;
};
