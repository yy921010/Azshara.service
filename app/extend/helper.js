'use strict';

const ObjProto = Object.prototype;
const toString = ObjProto.toString,
  hasOwnProperty = ObjProto.hasOwnProperty;

module.exports = {

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

};
