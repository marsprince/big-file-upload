const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'Hello world';
  }
  async upload() {
    this.ctx.body = {
      test: 1
    }
  }
}

module.exports = HomeController;
