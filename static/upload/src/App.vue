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
  </div>
</template>

<script>
  import axios from 'axios'
  const size = 30 * 1024 // 1k = 1024

export default {
  name: 'app',
  data() {
    return {
      file: null,
      fileList: []
    }
  },
  methods:{
    beforeUpload(file) {
      // split
      const fileChunkList = [];
      let cur = 0;
      while (cur < file.size) {
        const chunkFile  = file.slice(cur, cur + size)
        chunkFile.name = file.name
        fileChunkList.push(chunkFile);
        cur += size;
      }
      this.fileList = fileChunkList
      this.file = file
      return false
    },
    upload() {
      axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
      Promise.all(this.fileList.map((file, index)=> {
        return this.uploadFile(file, index)
      })).then(res => {
        axios.post('http://localhost:3000/merge_upload', {
          name: this.file.name,
          size
        })
      })
    },
    uploadFile(file, index) {
      return new Promise(resolve => {
        const data = new FormData()
        // the blob
        data.append('chunk', file)
        // file name
        data.append('name', this.file.name)
        // index
        data.append('index', index)
        // total length
        data.append('total', this.fileList.length)
        axios.post('http://localhost:3000/upload', data).then(res=> {
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
