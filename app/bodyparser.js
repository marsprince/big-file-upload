// simple bodyparser
module.exports = async (ctx, next)=> {
  await new Promise((resolve,reject) => {
    try {
      let postdata = "";
      ctx.req.on('data', (data) => {
        postdata += data
      })
      ctx.req.on("end", async () =>{
        ctx.request.body = JSON.parse(postdata)
        resolve()
      })
    } catch ( err ) {
      reject()
    }
  })
  await next()
}
