'use strict';

module.exports = app => {
  class Model {
    constructor(ctx) {
      this.ctx = ctx;
    }

    /**
     * 验证终端
     * @param clientId
     * @param clientSecret
     * @return {Promise<{grants: [string, string], clientId: *, clientSecret: *}>}
     */
    async getClient(clientId, clientSecret) {
      const deviceInfo = await this.ctx.service.device.getDeviceInfoByDeviceId(clientId);
      if (this.ctx.helper.isEmpty(deviceInfo) || clientSecret !== deviceInfo.deviceSecret) {
        this.ctx.logger.warn('[oauth][getClient] msg-->client has not registered!!');
        return;
      }
      return {
        clientId,
        clientSecret,
        grants: [
          'password',
          'refresh_token',
        ],
      };
    }

    /**
     * 验证用户名和密码
     * @param username
     * @param password
     * @return {Promise<{userId: (string|string)}>}
     */
    async getUser(username, password) {
      const userInfo = await this.ctx.service.user.getUserByUsername(username);
      const userId = userInfo.userId;
      const emailInfo = await this.ctx.service.email.getEmailByUserId(userId);
      const _passwordSalt = userId + password + app.config.keys;
      const userFinalPass = this.ctx.helper.cryptoMd5(password, _passwordSalt);
      if (this.ctx.helper.isEmpty(userInfo) || userInfo.password !== userFinalPass || emailInfo.isValidate !== 1) {
        this.ctx.logger.warn('[oauth] [getUser] msg--> username or password is wrong');
        return;
      }
      return { userId: userInfo.userId };
    }

    /**
     * 得到token
     * @param bearerToken
     * @return {Promise<*>}
     */
    async getAccessToken(bearerToken) {
      const token = this.ctx.helper.getAccessToken4Token(bearerToken);
      if (!token) {
        return;
      }
      token.accessTokenExpiresAt = new Date(token.accessTokenExpiresAt);
      token.refreshTokenExpiresAt = new Date(token.refreshTokenExpiresAt);
      return token;
    }

    /**
     * 保存token
     * @param token
     * @param client
     * @param user
     * @return {Promise<any>}
     */
    async saveToken(token, client, user) {
      const _token = Object.assign({}, token, { user }, { client });
      this.ctx.helper.saveToken(_token);
      return _token;
    }

    revokeToken(token) {
      return this.ctx.helper.deleteToken4TokenStr(token.refreshToken, true);
    }

    async getRefreshToken(refreshToken) {
      const _refreshToken = this.ctx.helper.getRefreshToken4Token(refreshToken);
      if (!_refreshToken) return;
      return {
        refreshToken: _refreshToken.refreshToken,
        refreshTokenExpiresAt: new Date(_refreshToken.refreshTokenExpiresAt),
        scope: _refreshToken.scope,
        client: _refreshToken.client, // with 'id' property
        user: _refreshToken.user,
      };
    }
  }
  return Model;
};
