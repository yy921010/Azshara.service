'use strict';

const Service = require('egg').Service;
const uuidv1 = require('uuid/v1');
const fs = require('fs');
const path = require('path');

module.exports = class DeviceService extends Service {

  /**
     * 根据deviceId 查询设备信息
     * @param deviceId
     * @return {Promise<void>}
     */
  async getDeviceInfoByDeviceId(deviceId) {
    if (!deviceId) return deviceInfo;
    const { ctx, app: { mysql } } = this;
    ctx.logger.debug('[device] [getDeviceInfoByDeviceId] msg--> enter');
    const deviceClient = mysql.get('moki_device');
    return await deviceClient.get('info', {
      deviceId,
    });

  }

  /**
     * 添加设备信息
     * @param deviceInfo
     * @return {Promise<unknown>}
     */
  async addDevice(deviceInfo = {}) {
    const finalResult = {};
    this.ctx.logger.debug('[device] [addDevice] msg--> enter');
    if (this.ctx.helper.isEmpty(deviceInfo)) {
      finalResult.status = false;
    } else {
      const { ctx, app: { mysql } } = this;
      const deviceClient = mysql.get('moki_device');
      deviceInfo.updateTime = deviceClient.literals.now;
      deviceInfo.createdTime = deviceClient.literals.now;
      deviceInfo.deviceId = uuidv1();
      deviceInfo.deviceSecret = ctx.helper.cryptoMd5(deviceInfo.deviceId);
      const result = await deviceClient.insert('info', deviceInfo);
      if (result.affectedRows === 1) {
        finalResult.status = true;
        finalResult.actorInsertId = result.insertId;
      }
    }
    return finalResult;
  }

  async updateDeviceInfo(deviceInfo = {}) {
    const { ctx, app: { mysql } } = this;
    this.ctx.logger.debug('[device] [updateDeviceInfo] msg--> enter');
    const deviceClient = mysql.get('moki_device');
    deviceInfo.updateTime = deviceClient.literals.now;
    if (!deviceInfo.id) {
      ctx.logger.warn('[device][updateDeviceInfo] msg--> device table is contain proper id');
      return new Promise(resolve => resolve({ status: false }));
    }
    deviceInfo.id = parseInt(deviceInfo.id, 10);
    deviceInfo.isValidate = parseInt(deviceInfo.isValidate, 10);
    return deviceClient.beginTransactionScope(async conn => {
      await conn.update('info', deviceInfo);
      const dInfo = await conn.get('info', {
        id: deviceInfo.id,
      });
      if (dInfo && dInfo.isValidate === 1) {
        // send email to deviceId and deviceSecret
        const BasicId = Buffer.from(`${dInfo.deviceId}:${dInfo.deviceSecret}`).toString('base64');
        ctx.logger.debug('[DeviceService] [updateDeviceInfo] deviceId and deviceSecret', [ dInfo.deviceId, dInfo.deviceSecret ]);
        ctx.logger.debug('[DeviceService] [updateDeviceInfo] BasicId', BasicId);
        ctx.logger.debug('[DeviceService] [updateDeviceInfo] email', dInfo.email);
        const htmlStr = await this.readEmailTemplate(BasicId);
        await ctx.helper.sendMail({
          from: '805841483@qq.com',
          to: dInfo.email,
          subject: '注册成功',
          html: htmlStr,
        });
        return {
          status: true,
        };
      }
      return { status: false };
    }, ctx);
  }

  async readEmailTemplate(baseId) {
    const file = path.resolve(this.config.baseDir, 'app/public/html/email-template.html');
    const template = await fs.readFileSync(file);
    const templateStr = template.toString();
    return templateStr.replace(/\{\{(.+?)\}\}/g, baseId);
  }


  async deleteDevice(deviceId) {
    const { ctx, app: { mysql } } = this;
    ctx.logger.debug('[device] [deleteDevice] msg--> enter');
    if (!deviceId) {
      return new Promise(resolve => resolve({ status: false }));
    }
    const deviceClient = mysql.get('moki_device');
    const result = await deviceClient.delete('info', {
      id: +deviceId,
    });
    return { status: result.affectedRows >= 1 };
  }
};
