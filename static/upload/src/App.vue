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

export default {
  name: 'app',
  data() {
    return {
      file: null
    }
  },
  methods:{
    beforeUpload(file) {
      this.file = file
      return false
    },
    upload() {
      axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
      const data = new FormData()
      data.append('filesss', this.file)
      axios.post('http://localhost:3000/upload', data)
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
