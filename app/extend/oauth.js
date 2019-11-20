'use strict';

module.exports = app => {
  class Model {
    constructor(ctx) {
      this.ctx = ctx;
    }

    async getClient(clientId, clientSecret) {
      const deviceInfo = await this.ctx.service.device.getDeviceInfoByDeviceId(clientId);
      if (this.ctx.helper.isEmpty(deviceInfo) || clientSecret !== deviceInfo.clientSecret) {
        this.ctx.logger.warn('[oauth][getClient] msg-->client has not registered!!');
        return;
      }
      return {
        clientId,
        clientSecret,
      };
    }


    async getUser(username, password) {
      const userInfo = await this.ctx.service.user.getUserByUsername(username);
      if (this.ctx.helper.isEmpty(userInfo) || userInfo.password !== password) {
        this.ctx.logger.warn('[oauth] [getUser] msg--> username or password is wrong');
        return;
      }
      return {
        userId: userInfo.userId,
      };
    }

    async getAccessToken(bearerToken) {}
    async saveToken(token, client, user) {
      const _token = Object.assign({}, token, { user }, { client });

      return _token;
    }
    async revokeToken(token) {}
  }
  return Model;
};
