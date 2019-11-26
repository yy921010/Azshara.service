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
    result.status ? this.success('新增成功') : this.fail('新增失败', deviceAddFailed);
  }


  async deleteDevice() {
    const { ctx } = this;
    ctx.validate({ id: 'string' }, ctx.request.query);
    const result = await ctx.service.device.deleteDevice(ctx.request.query.id);
    result.status ? this.success('删除成功') : this.fail('删除失败', deviceDeleteFailed);
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
    result.status ? this.success('更新成功') : this.fail('更新失败', deviceUpdateFailed);
  }
};
