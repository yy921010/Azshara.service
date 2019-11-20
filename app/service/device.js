'use strict';

const Service = require('egg').Service;

module.exports = class DeviceService extends Service {

  /**
     * 根据deviceId 查询设备信息
     * @param deviceId
     * @return {Promise<void>}
     */
  async getDeviceInfoByDeviceId(deviceId) {
    let deviceInfo = {};
    if (!deviceId) return deviceInfo;
    const { ctx, app: { mysql } } = this;
    ctx.logger.debug('[device] [getDeviceInfoByDeviceId] msg--> enter');
    const deviceClient = mysql.get('moki_device');
    const deviceInfos = await deviceClient.query('select info.deviceSecret, info.email from info where info.deviceId = ?', [ deviceId ]);
    if (deviceInfos && deviceInfos.length >= 0) {
      deviceInfo = deviceInfos[0];
    }
    return deviceInfo;
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
      const newDateStr = new Date().toString();
      deviceInfo.updateTime = deviceClient.literals.now;
      deviceInfo.createdTime = deviceClient.literals.now;
      deviceInfo.deviceId = ctx.helper.randamStr();
      deviceInfo.deviceSecret = ctx.helper.cryptoMd5(newDateStr);
      const result = await deviceClient.insert('info', deviceInfo);
      if (result.affectedRows === 1) {
        finalResult.status = true;
        finalResult.actorInsertId = result.insertId;
      }
    }
    return new Promise(resolve => {
      resolve(finalResult);
    });
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
    await deviceClient.update('info', deviceInfo);
    return new Promise(resolve => resolve({ status: true }));
  }

  async deleteDevice(deviceId) {
    const { ctx, app: { mysql } } = this;
    ctx.logger.debug('[device] [deleteDevice] msg--> enter');
    if (!deviceId) {
      return new Promise(resolve => resolve({ status: false }));
    }
    const deviceClient = mysql.get('moki_device');
    await deviceClient.delete('info', {
      id: deviceId,
    });
    return new Promise(resolve => resolve({ status: true }));
  }
};
