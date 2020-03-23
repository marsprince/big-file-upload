const fs = require('fs-extra');
const path = require('path');
const baseDirectory = path.join(__dirname, 'tmp');
const getTargetDirectory = (hash)  => {
  return path.join(baseDirectory, hash)
}

module.exports.rename = function(files, field) {
  // use hash as name
  const keys = Object.keys(files)
  const targetDirectory = getTargetDirectory(field.hash)
  keys.forEach(key => {
    const file = files[key];
    fs.ensureDirSync(targetDirectory)
    // create new dir
    fs.renameSync(file.path, path.join(targetDirectory, `${field.hash}-${field.index}`))
  })
}

module.exports.merge = function(data) {
  const {size, hash} = data;
  const targetDirectory = getTargetDirectory(hash)
  // target output path to write
  const filePath = path.join(targetDirectory, data.name)
  // merge file
  const chunkPaths = fs.readdirSync(targetDirectory)
  // sort
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  // 管道流，用输出流消费输入流
  chunkPaths.map((chunk,index) => {
    // 1.并行创建指定位置的可写流
    // 2.创建一个可写流，在每次写完之后写下一个
    const writeStream = fs.createWriteStream(filePath, {
      start: index * size,
      end: (index+1) * size
    });
    const readStream = fs.createReadStream(path.join(targetDirectory,chunk))
    readStream.pipe(writeStream)
  })
}

module.exports.verify = function(data) {
  const targetDirectory = getTargetDirectory(data.hash)
  // 服务器上存储的文件为
  // 合并后的文件 hash-后缀
  // 切片 hash-index
  // first check if file exist
  const extractExt = filename =>
    filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名
  const fileName = data.hash + extractExt(data.name)
  if(fs.existsSync(path.join(targetDirectory, fileName))) {
    // 上传已经完成
    return {
      code: 0,
      message: 'success'
    }
  } else {
    const list = fs.readdirSync(targetDirectory)
    // 上传没有完成，查找所有切片并返回
    return {
      code: 1,
      list
    }
  }
}
