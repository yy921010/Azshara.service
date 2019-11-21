'use strict';

const Service = require('egg').Service;
const uuidv1 = require('uuid/v1');

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
    return new Promise(resolve => resolve(deviceInfo));
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
    return new Promise(resolve => {
      resolve(finalResult);
    });
  }

  async updateDeviceInfo(deviceInfo = {}) {
    const { ctx, app: { mysql, email } } = this;
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
      const deviceInfos = await conn.query('select info.deviceId, info.email, info.deviceSecret from info where info.id = ?', [ deviceInfo.id ]);
      if (deviceInfos && deviceInfos.length >= 0 && deviceInfo.isValidate === 1) {
        const dInfo = deviceInfos[0];
        // send email to deviceId and deviceSecret
        const BasicId = Buffer.from(`${dInfo.deviceId}:${dInfo.deviceSecret}`).toString('base64');
        ctx.logger.debug('[DeviceService] [updateDeviceInfo] deviceId and deviceSecret', [ dInfo.deviceId, dInfo.deviceSecret ]);
        ctx.logger.debug('[DeviceService] [updateDeviceInfo] BasicId', BasicId);
        ctx.logger.debug('[DeviceService] [updateDeviceInfo] email', dInfo.email);
        const mailOptions = {
          from: '805841483@qq.com',
          to: dInfo.email,
          subject: '您的设备ID',
          html: `<h1>请在请求token时 header中添加Authorization 属性，值为： Basic ${BasicId}</h1>`,
        };
        email.sendMail(mailOptions, (error, response) => {
          if (error) {
            ctx.logger.warn('[DeviceService] [updateDeviceInfo] sendMail error:', error);
          } else {
            ctx.logger.info('[DeviceService] [updateDeviceInfo] sendMail:', response.message);
          }
          email.close();
        });
        return {
          status: true,
        };
      }

    }, ctx);
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
    return new Promise(resolve => resolve({ status: result.affectedRows >= 1 }));
  }
};
