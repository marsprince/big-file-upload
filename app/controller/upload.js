const Controller = require('../../base/Controller')
class UploadController extends Controller {
  upload() {
    console.log(this.ctx);
  }
}

module.exports = UploadController
