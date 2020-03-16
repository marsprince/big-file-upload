const koaRouter = require('koa-router');
const router = new koaRouter();
const Controller = require('./Controller')

class Router {
  constructor() {
    this._router = router
  }
  get(path, middleware) {
    let middlewareInstance = middleware;
    if(middleware instanceof Controller) {

    }
  }
}

module.exports = Router

