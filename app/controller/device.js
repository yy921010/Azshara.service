'use strict';
const Controller = require('./base_controller');

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
    result.status ? this.success('新增成功') : this.success('新增失败');
  }


  async deleteDevice() {
    const { ctx } = this;
    ctx.validate({ id: 'string' }, ctx.request.query);
    const result = await ctx.service.device.deleteDevice(ctx.request.query.id);
    this.success(result ? '删除成功' : '删除失败');
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
    result.status ? this.success('更新成功') : this.success('更新失败');
  }
};
