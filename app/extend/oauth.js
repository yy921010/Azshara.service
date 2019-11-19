'use strict';

module.exports = app => {
  class Model {
    constructor(ctx) {
      this.ctx = ctx;
    }
    async getClient(clientId, clientSecret) {}


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
    async saveToken(token, client, user) {}
    async revokeToken(token) {}
    async getAuthorizationCode(authorizationCode) {}
    async saveAuthorizationCode(code, client, user) {}
    async revokeAuthorizationCode(code) {}
  }
  return Model;
};
