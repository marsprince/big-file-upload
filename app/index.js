const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const cors = require('./koa-cors')
const formidable = require('formidable');
const bodyparser = require('./bodyparser')
const rename = require('./util').rename
const merge = require('./util').merge;
const verify = require('./util').verify

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
  // if(Math.random()<0.5){
  //   // 概率报错
  //   ctx.status=500
  //   return
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
      // mkdir
      // rename
      rename(files, fields)
      // fields => expect file
      // files => all file
      ctx.set('Content-Type', 'application/json');
      ctx.status = 200;
      ctx.state = { fields, files };
      ctx.body = JSON.stringify(ctx.state, null, 2);
      resolve();
    });
  });
  await next();
});

router.post('/upload_merge', bodyparser, async (ctx, next) => {
  // merge
  merge(ctx.request.body)
  ctx.set('Content-Type', 'application/json');
  ctx.body = ctx.request.body
});
// 验证接口，发送hash，如果已存在，则不需要再次上传，如果不存在，则返回已上传切片
router.post('/upload_verify', bodyparser, async (ctx, next) => {
  ctx.set('Content-Type', 'application/json');
  ctx.body = verify(ctx.request.body)
})

app.use(cors)
app
.use(router.routes())
.use(router.allowedMethods());

app.listen(3000)
