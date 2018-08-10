<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>

<style lang="scss">
* { margin: 0; padding: 0; }
.clear { clear: both; }
img, a img { border: none; }
input { outline: none; }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  padding:0;
  box-sizing: border-box;
  @media screen and (min-width:1024px){
    max-width:320px;
    max-height: 568px;
  }
}
</style>
