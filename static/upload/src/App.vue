<template>
  <div id="app">
    <el-button @click="upload">上传</el-button>
  </div>
</template>

<script>
  import axios from 'axios'

export default {
  name: 'app',
  methods:{
    upload() {
      axios.post('http://localhost:7001/upload').then(res => {
        console.log(res);
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
