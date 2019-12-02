'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = '<h1>hi, this is a tomokotv service</h1>';
  }

  async showAuth() {
    const { ctx } = this;
    ctx.body = 'hi, egg show auth';
  }
}

module.exports = HomeController;
