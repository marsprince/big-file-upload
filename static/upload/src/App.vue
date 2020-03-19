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
    <el-button type="primary" @click="cancel">暂停</el-button>
    <el-progress :text-inside="true" :stroke-width="26" :percentage="percentage"></el-progress>
  </div>
</template>

<script>
  import axios from 'axios'
  const size = 100 * 1024 * 1024 // 1k = 1024
  const CancelToken = axios.CancelToken;

export default {
  name: 'app',
  data() {
    return {
      file: null,
      fileList: []
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
    // 恢复
    resume() {
      // 缓存hash
      const hash = this.calculateHash();
      axios.post('http://localhost:3000/upload_verify', {
        name: this.file.name,
        hash
      })
    },
    cancel() {
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
      return this.file.name + this.file.size
    },
    upload() {
      axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
      const hash  = this.calculateHash();
      Promise.all(this.fileList.map((file, index)=> {
        return this.uploadFile(file, index, hash)
      })).then(res => {
        axios.post('http://localhost:3000/upload_merge', {
          name: this.file.name,
          size
        })
      })
    },
    uploadFile(file, index, hash) {
      return new Promise(resolve => {
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
        this.fileList[index].source = source
        axios.post('http://localhost:3000/upload', data, {
          cancelToken: source.token,
          onUploadProgress: (progressEvent) => {
            // update percentage
            this.fileList[index].percentage = parseInt((progressEvent.loaded / progressEvent.total).toFixed(2)) * 100
          }
        }).then(res=> {
          resolve(res)
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
