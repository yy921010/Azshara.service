'use strict';
const Controller = require('./base_controller');
const { deviceAddFailed, deviceDeleteFailed, deviceUpdateFailed } = require('./error_code');

module.exports = class DeviceController extends Controller {

  async addDevice() {
    const { ctx } = this;
    const deviceInfo = ctx.request.body;
    ctx.logger.debug('[DeviceController] [addDevice] deviceInfo:', deviceInfo);
    ctx.validate({
      title: 'string',
      email: 'email',
    }, deviceInfo);
    const result = await ctx.service.device.addDevice(deviceInfo);
    result.status ? this.success('终端注册成功') : this.fail('终端注册失败', deviceAddFailed);
  }


  async deleteDevice() {
    const { ctx } = this;
    ctx.validate({ id: 'string' }, ctx.request.query);
    const result = await ctx.service.device.deleteDevice(ctx.request.query.id);
    result.status ? this.success('终端删除成功') : this.fail('终端删除失败', deviceDeleteFailed);
  }

  async updateDevice() {
    const { ctx } = this;
    const deviceInfo = ctx.request.body;
    ctx.validate({
      id: {
        type: 'string',
      },
      isValidate: {
        type: 'string',
      },
    }, deviceInfo);
    const result = await ctx.service.device.updateDeviceInfo(deviceInfo);
    result.status ? this.success('终端设备更新成功') : this.fail('终端设备更新失败', deviceUpdateFailed);
  }
};
