const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const cors = require('./koa-cors')
const formidable = require('formidable');
const fs =require('fs')
const path = require('path')

router.post('/upload', async (ctx, next) => {
  // ctx.router available
  // try {
  //   let postdata = "";
  //   // node 的 request 对象
  //   ctx.req.on('data', (data) => {
  //     postdata += data
  //   });
  //   ctx.req.on("end",function() {
  //     console.log(postdata);
  //   })
  // } catch ( err ) {
  //
  // }
  const form = formidable({ multiples: true, uploadDir: __dirname, keepExtensions: true });

  // not very elegant, but that's for now if you don't want touse `koa-better-body`
  // or other middlewares.
  await new Promise((resolve, reject) => {
    form.parse(ctx.req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      ctx.set('Content-Type', 'application/json');
      ctx.status = 200;
      ctx.state = { fields, files };
      ctx.body = JSON.stringify(ctx.state, null, 2);
      resolve();
    });
  });
  await next();
});
app.use(cors)
app
.use(router.routes())
.use(router.allowedMethods());

app.listen(3000)
