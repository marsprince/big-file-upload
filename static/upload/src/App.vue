<template>
  <div id="app">
    <el-upload
      action=""
      :before-upload="beforeUpload"
      ref="upload">
      <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="upload">上传到服务器</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    <el-button type="primary" @click="onClick">{{this.isStop ? '恢复':'暂停'}}</el-button>
    <el-progress :text-inside="true" :stroke-width="26" :percentage="percentage"></el-progress>
  </div>
</template>

<script>
import axios from 'axios'
const size = 100 * 1024 * 1024 // 1k = 1024
const CancelToken = axios.CancelToken;
const maxRequestCount = 2;
import SparkMD5 from 'spark-md5'

export default {
  name: 'app',
  data() {
    return {
      file: null,
      fileList: [],
      isStop: false,
      compeleteList: [],
      hash: null,
      failure: false
    }
  },
  computed: {
    // 总体百分比由每个blob百分比* size/totalSize计算
    percentage() {
      return this.fileList.length === 0 ? 0 : this.fileList.reduce((pre, item)=>{
        return pre + Number((item.percentage * item.chunk.size / this.file.size).toFixed(2))
      }, 0)
    }
  },
  methods:{
    onClick() {
      if(this.isStop) {
        this.resume()
      } else {
        this.stop()
      }
      this.isStop = !this.isStop
    },
    // 恢复
    resume() {
      axios.post('http://localhost:3000/upload_verify', {
        name: this.file.name,
        hash: this.hash
      }).then(res => {
        const {data} = res;
        if(data.code === 1) {
          // 只上传未完成切片
          this.compeleteList = data.list
          this.upload()
        }
      })
    },
    stop() {
      this.fileList.forEach(item => {
        item.source.cancel()
      })
    },
    beforeUpload(file) {
      // split
      const fileChunkList = [];
      let cur = 0;
      while (cur < file.size) {
        const chunkFile  = file.slice(cur, cur + size)
        chunkFile.name = file.name
        fileChunkList.push({
          chunk: chunkFile,
          percentage: 0,
        });
        cur += size;
      }
      this.fileList = fileChunkList
      this.file = file
      return false
    },
    calculateHash() {
      const fileChunkList = this.fileList
      const spark = new SparkMD5.ArrayBuffer();
      return new Promise(resolve => {
        // let percentage = 0;
        let count = 0;
        const loadNext = index => {
          const reader = new FileReader();
          reader.readAsArrayBuffer(fileChunkList[index].chunk);
          reader.onload = e => {
            count++;
            spark.append(e.target.result);
            if (count === fileChunkList.length) {
              // self.postMessage({
              //   percentage: 100,
              //   hash: spark.end()
              // });
              // self.close();
              resolve(spark.end())
            } else {
              // percentage += 100 / fileChunkList.length;
              // self.postMessage({
              //   percentage
              // });
              // 递归计算下一个切片
              loadNext(count);
            }
          };
        };
        loadNext(0);
      })
    },
    sendRequest(list) {
      let i = maxRequestCount;
      let index = 0;
      const hash = this.hash;
      return new Promise((resolve,reject) => {
        const start = () => {
          if(i>0 && index < list.length) {
            i--;
            const file = list[index];
            this.uploadFile(file, index, hash).then(()=>{
              i++;
              index++;
              if(index === list.length) {
                resolve()
              } else {
                start()
              }
            }).catch(()=>{
              reject()
            })
          }
        }
        start()
      })
    },
    async upload() {
      axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
      if(!this.hash) {
        this.hash = await this.calculateHash();
      }
      const hash = this.hash;
      let list = this.fileList;
      if(this.failure) {
        list = list.filter(i => i.failure)
      }
      this.sendRequest(list.filter((item, index) => !this.compeleteList.includes(`${hash}-${index}`)))
      .then(res => {
        axios.post('http://localhost:3000/upload_merge', {
          name: this.file.name,
          size,
          hash
        }).then(res => {
          this.hash = null
          this.failure = false
        })
      }).catch(err => {
        // 可以写一些重试策略
        this.upload(true)
      })
    },
    uploadFile(file, index, hash) {
      return new Promise((resolve,reject) => {
        const data = new FormData()
        // the blob
        data.append('chunk', file.chunk)
        // file name
        data.append('name', this.file.name)
        // index
        data.append('index', index)
        // total length
        data.append('total', this.fileList.length)
        // hash 暂时用文件名+文件大小作为Hash
        data.append('hash', hash)
        // add cancel token
        const source = CancelToken.source();
        this.fileList[index].source = source;
        // if fail, save then retry
        axios.post('http://localhost:3000/upload', data, {
          cancelToken: source.token,
          onUploadProgress: (progressEvent) => {
            // update percentage
            this.fileList[index].percentage = parseInt((progressEvent.loaded / progressEvent.total).toFixed(2)) * 100
          }
        }).then(res=> {
          this.fileList[index].failure = false;
          resolve(res)
        }).catch(err => {
          this.fileList[index].failure = true;
          this.failure = true
          reject(err)
        })
      })
    }
  }
}
</script>

<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
