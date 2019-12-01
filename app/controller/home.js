'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async showAuth() {
    const { ctx } = this;
    ctx.body = 'hi, egg show auth';
  }
}

module.exports = HomeController;
