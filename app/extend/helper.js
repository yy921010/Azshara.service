'use strict';
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const ObjProto = Object.prototype;
const toString = ObjProto.toString,
  hasOwnProperty = ObjProto.hasOwnProperty;

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

  /**
   * 将model的key 转换为大写
   * @param {object} modelMap model类型
   */
  modelToField(modelMap = {}) {
    if (this.isEmpty(modelMap)) {
      return;
    }
    const keys = Object.keys(modelMap);
    const tempMap = {};
    if (keys.length > 0) {
      keys.forEach(key => {
        let resultKey;
        resultKey = key.replace(/[A-Z]/g, (txt, index) => {
          return index === 0 ? txt : `_${txt}`;
        });
        resultKey = resultKey.toUpperCase();
        tempMap[resultKey] = modelMap[key];
      });
    }
    return tempMap;
  },

  modelToFields(modelMaps = []) {
    return modelMaps.length > 0 ? modelMaps.map(item => this.modelToField(item)) : [];
  },

  makeModelField(table, fieldMap = {}) {
    if (this.isEmpty(fieldMap) || this.isEmpty(table)) {
      return;
    }
    const keys = Object.keys(fieldMap);
    let tempStr = '';
    const maxIndex = keys.length - 1;
    keys.forEach((key, index) => {
      if (maxIndex === index) {
        tempStr += `${table}.${fieldMap[key]} AS ${key}`;
      } else {
        tempStr += `${table}.${fieldMap[key]} AS ${key}, `;
      }
    });
    return tempStr;
  },

  selectColumns(table, fieldMap = {}) {
    let columnStr = this.makeModelField(table, fieldMap);
    if (!columnStr) {
      columnStr = '*';
    }
    if (columnStr === '*') {
      return 'SELECT * FROM ??'.replace(/\?\?/, table);
    }
    return `SELECT ?? FROM ${table}`.replace(/\?\?/, columnStr);
  },
  /**
   *
   * @param {table,fieldSet,asName} queryField
   * @param  {...any} tables
   */
  selectColumnsMigrate(queryField, ...tables) {
    tables.forEach(table => {

    });
  },

  whereCaseMultipartTable() {

  },
  /**
     * 创建初始化文件：upload, .temp
     */
  _makeUploadDir() {
    const { config: { upload: { baseDir } }, config: { upload } } = this;
    Object.keys(upload).forEach(key => {
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
        this.logger.debug('[helper] [getMkdirName] dirPathName=', dirPathName);
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
   * @param {string} pathName
   */
  deleteDir(pathName) {
    let files = [];
    let isScuess = false;
    // 判断给定的路径是否存在
    if (fs.existsSync(pathName)) {
      // 返回文件和子目录的数组
      files = fs.readdirSync(pathName);
      files.forEach(file => {
        const curPath = path.join(pathName, file);
        // 同步读取文件夹文件，如果是文件夹，则函数回调
        if (fs.statSync(curPath).isDirectory()) {
          this.deleteDir(curPath);
        } else {
          // 是指定文件，则删除
          fs.unlinkSync(curPath);
        }
      });
      // 清除文件夹
      fs.rmdirSync(pathName);
      isScuess = true;
    } else {
      this.logger.info('给定的路径不存在！');
    }
    return isScuess;
  },
  /**
   * 根据文件名删除
   * @param {string} name
   * @param {string} pathName
   */
  deleteFileByName(name, pathName) {
    let files = [];
    let isScuess = false;
    // 判断给定的路径是否存在
    if (fs.existsSync(pathName)) {
      // 返回文件和子目录的数组
      files = fs.readdirSync(pathName);
      files.forEach(file => {
        const curPath = path.join(pathName, file);
        // 同步读取文件夹文件，如果是文件夹，则函数回调
        if (fs.statSync(curPath).isDirectory()) {
          this.deleteFileByName(curPath, name);
        } else {
          // 是指定文件，则删除
          if (file.indexOf(name) > -1) {
            fs.unlinkSync(curPath);
            isScuess = true;
            this.logger.info('删除文件：' + curPath);
          }
        }
      });

    } else {
      this.logger.info('给定的路径不存在：');
    }
    return isScuess;
  },

  randamStr(randamLength = 36) {
    const randamArrs = [],
      strDec = '0123456789abcdef';

    for (let i = 0; i < randamLength; i++) {
      randamArrs[i] = strDec.substr(Math.floor(16 * Math.random()), 1);
    }
    randamArrs[14] = '4';
    randamArrs[19] = strDec.substr(8, 1);
    randamArrs[8] = randamArrs[13] = randamArrs[18] = randamArrs[23] = '-';
    const n = randamArrs.join('');
    return n;
  },

};
