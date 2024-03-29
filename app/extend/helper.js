'use strict';
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const crypto = require('crypto');

const ObjProto = Object.prototype;
const toString = ObjProto.toString,
  hasOwnProperty = ObjProto.hasOwnProperty;
const TokenPools = [];

module.exports = {

  dayjs,

  isArray(anyOpt) {
    return toString.call(anyOpt) === '[object Array]';
  },

  isString(obj) {
    return toString.call(obj) === '[object String]';
  },

  isArguments(obj) {
    return toString.call(obj) === '[object Arguments]';
  },

  has(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  },

  isEmpty(anyOpt) {
    if (anyOpt == null) {
      return true;
    }
    if (this.isArray(anyOpt) || this.isString(anyOpt) || this.isArguments(anyOpt)) {
      return anyOpt.length === 0;
    }
    for (const key in anyOpt) {
      if (this.has(anyOpt, key)) {
        return false;
      }
    }
    return true;
  },


  compact(array = []) {
    return array.filter(a => a);
  },

  /**
   * 将model的key 转换为大写
   * @param {object} modelMap model类型
   * @param isRetainId 是否保留id 字段
   */
  modelToField(modelMap = {}, isRetainId) {
    if (this.isEmpty(modelMap)) {
      return;
    }
    const keys = Object.keys(modelMap);
    const tempMap = {};
    keys.forEach(key => {
      const resultKey = this.toUpperCaseKey(key);
      tempMap[resultKey] = modelMap[key];
    });
    if (isRetainId) {
      tempMap.id = tempMap.ID;
      delete tempMap.ID;
    }
    modelMap = {};
    return tempMap;
  },

  toUpperCaseKey(key) {
    return key
      .replace(/[A-Z]/g, (txt, index) => (index === 0 ? txt : `_${txt}`))
      .toUpperCase();
  },

  modelToFields(modelMaps = []) {
    return modelMaps.length > 0 ? modelMaps.map(item => this.modelToField(item)) : [];
  },

  mapColumnField(mapColumns = [], table) {
    if (this.isEmpty(mapColumns) || this.isEmpty(table)) {
      return '';
    }
    const queryCaseArrs = mapColumns.map(key => (`${table}.${this.toUpperCaseKey(key)} AS ${key}`));
    return queryCaseArrs.toString();
  },

  /**
   *
   * @param {table,mapColumns} queryFields
   */
  selectColumns(...queryFields) {
    let sqlStr = 'SELECT * FROM ??';
    const queryCaseArrs = queryFields
      .map(queryField => {
        return this.isEmpty(queryField.mapColumns) ?
          '' : this.mapColumnField(queryField.mapColumns, queryField.table);
      })
      .filter(a => a)
      .toString();
    const tableStr = queryFields
      .map(item => item.table)
      .toString();
    if (!this.isEmpty(queryCaseArrs)) {
      sqlStr = sqlStr.replace(/\*/, queryCaseArrs);
    }
    return sqlStr.replace(/\?\?/, tableStr);
  },
  /**
   *
   * @param {equalCase,queryCase} option
   */
  whereMultiTable(equal, query) {
    if (this.isEmpty(equal)) {
      this.logger.warn('[helper][whereMultiTable] msg--> equalField is Empty');
      return '';
    }
    const equalFields = Object.keys(equal)
      .map(key => (`${key} = ${equal[key]}`))
      .join(' AND ');
    let sqlStr = ` WHERE ${equalFields}`;
    if (!this.isEmpty(query)) {
      const queryCases = Object.keys(query)
        .map(key => (`${key} = ${query[key]}`))
        .join(' AND ');
      sqlStr += ` AND ${queryCases}`;
    }
    return sqlStr;
  },
  /**
   * 创建初始化文件：upload, .temp
   */
  _makeUploadDir() {
    const { config: { upload: { baseDir } }, config: { upload } } = this;
    Object.keys(upload)
      .forEach(key => {
        if ([ 'baseDir', 'imageService' ].includes(key)) {
          return;
        }
        const dirPathName = path.join(this.config.baseDir, baseDir, key);
        if (!fs.existsSync(dirPathName)) {
          fs.mkdirSync(dirPathName);
        }
      });
  },

  getMkdirName(...fileNames) {
    const { config: { upload: { baseDir } } } = this;
    let dirPathName = '';
    let pathChild = '';
    this._makeUploadDir();
    if (fileNames.length > 0) {
      fileNames.forEach(fileName => {
        pathChild = pathChild.concat(`${fileName}/`);
        dirPathName = path.join(this.config.baseDir, baseDir, pathChild);
        if (!fs.existsSync(dirPathName)) {
          fs.mkdirSync(dirPathName);
        }
      });
    } else {
      dirPathName = path.join(this.config.baseDir, baseDir);
    }
    return dirPathName;
  },

  pathName(...modules) {
    return modules.join('/');
  },


  /**
   * 删除文件夹
   * @param {string} pathName 文件
   */
  deleteDir(pathName) {
    let files = [];
    let isSuccess = false;
    // 判断给定的路径是否存在
    if (fs.existsSync(pathName)) {
      // 返回文件和子目录的数组
      files = fs.readdirSync(pathName);
      files.forEach(file => {
        const curPath = path.join(pathName, file);
        // 同步读取文件夹文件，如果是文件夹，则函数回调
        if (fs.statSync(curPath)
          .isDirectory()) {
          this.deleteDir(curPath);
        } else {
          // 是指定文件，则删除
          fs.unlinkSync(curPath);
        }
      });
      // 清除文件夹
      fs.rmdirSync(pathName);
      isSuccess = true;
    } else {
      this.logger.warn('[helper] [deleteDir] msg--> the path is not found');
    }
    return isSuccess;
  },
  /**
   * 根据文件名删除
   * @param {string} name
   * @param {string} pathName
   */
  deleteFileByName(fileName) {
    const name = fileName.split('/')
      .pop();
    const prePathName = fileName.replace(/[^\/]*$/, '');
    const pathName = path.join(this.config.baseDir, this.config.upload.baseDir, prePathName);
    let files = [];
    let isSuccess = false;
    // 判断给定的路径是否存在
    if (fs.existsSync(pathName)) {
      // 返回文件和子目录的数组
      files = fs.readdirSync(pathName);
      files.forEach(file => {
        const curPath = path.join(pathName, file);
        // 同步读取文件夹文件，如果是文件夹，则函数回调
        if (fs.statSync(curPath)
          .isDirectory()) {
          this.deleteFileByName(curPath, name);
        } else {
          // 是指定文件，则删除
          if (file.indexOf(name) > -1) {
            fs.unlinkSync(curPath);
            isSuccess = true;
            this.logger.info(' [helper] [deleteFileByName] msg--> delete success');
          }
        }
      });

    } else {
      this.logger.warn('[helper] [deleteDir] msg--> the path is not found');
    }
    return isSuccess;
  },

  randamStr(randomLength = 36) {
    const randamArrs = [],
      strDec = '0123456789abcdefghijklmnopqrstuvwxyz';

    for (let i = 0; i < randomLength; i++) {
      randamArrs[i] = strDec.substr(Math.floor(16 * Math.random()), 1);
    }
    randamArrs[14] = '4';
    randamArrs[19] = strDec.substr(8, 1);
    randamArrs[8] = randamArrs[13] = randamArrs[18] = randamArrs[23] = '-';
    const n = randamArrs.join('');
    return n;
  },

  limit(limit, offset) {
    if (!limit || typeof limit !== 'number') {
      return '';
    }
    if (typeof offset !== 'number') {
      offset = 0;
    }
    return ' LIMIT ' + offset + ', ' + limit;
  },

  like(object) {
    if (!object) {
      return '';
    }
    const keys = Object.keys(object);
    if (keys.length === 1) {
      const field = keys[0];
      const queryVlaue = object[field] + '%';
      return ` WHERE ${field} LIKE '${queryVlaue}'`;
    }
    return '';

  },

  parseObject(objectStr) {
    let result;
    if (this.isString(objectStr)) {
      try {
        result = JSON.parse(objectStr);
      } catch (e) {
        this.logger.error('[helper][parseObject] msg--> JSON parse is error');
      }
    }
    return result;
  },

  cryptoMd5(defaultStr = '', salt = '') {
    const saltStr = `${defaultStr}:${salt}_zxcv4321`;
    const md5 = crypto.createHash('md5');
    return md5.update(saltStr).digest('hex');
  },

  aesEncrypt(data, key, iv) {
    let sign = '';
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    sign += cipher.update(data, 'utf8', 'hex');
    sign += cipher.final('hex');
    return sign;
  },

  aesDecrypt(encrypted, key, iv) {
    let src = '';
    const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    src += cipher.update(encrypted, 'hex', 'utf8');
    src += cipher.final('utf8');
    return src;
  },

  sendMail(emailOption) {
    const { ctx, app: { email } } = this;
    return new Promise(resolve => {
      email.sendMail(emailOption, (error, response) => {
        if (error) {
          resolve(error);
          ctx.logger.warn('[helper] [setEmail] sendMail error:', error);
        } else {
          resolve(response);
          ctx.logger.info('[helper] [setEmail] sendMail:', response);
        }
        email.close();
      });
    });
  },

  /**
   * 保存token
   * @param token
   */
  saveToken(token = {}) {
    const { user: { userId } } = token;
    const isExistToken = TokenPools.find(item => item.user.userId === userId);
    if (isExistToken) {
      for (let i = 0, len = TokenPools.length; i < len; i++) {
        const userId = token.user.userId;
        if (TokenPools[i].user.userId === userId) {
          TokenPools[i] = token;
        }
      }
    } else {
      TokenPools.push(token);
    }
    const allAccessToken = this.getAllAccessToken();
    this.ctx.logger.debug('[helper] [saveToken] allAccessToken=', allAccessToken);
  },

  /**
   * 通过userid 获得token
   * @param userId
   * @return {*}
   */
  getAccessToken4Token(accessToken = '') {
    return TokenPools.find(item => item.accessToken === accessToken);
  },

  getRefreshToken4Token(refreshToken) {
    return TokenPools.find(item => item.refreshToken === refreshToken);
  },


  /**
   * 通过userId 删除Token
   * @param userId
   */
  deleteToken4TokenStr(tokenStr = '', isRefreshToken = false) {
    const tokenIndex = TokenPools.findIndex(item => (isRefreshToken ?
      item.refreshToken === tokenStr : item.accessToken === tokenStr));
    if (tokenIndex >= 0) {
      TokenPools.splice(tokenIndex, 1);
      return true;
    }
    return false;
  },

  getAllAccessToken() {
    return TokenPools.map(tp => tp.accessToken);
  },

  decodeBase64(str) {
    return Buffer.from(str, 'base64').toString();
  },

};
