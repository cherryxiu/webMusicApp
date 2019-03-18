<template>
  <div id="app">
      <m-header></m-header>
      <router-view></router-view>
      <tab></tab>
      <!-- 切换路由并不会影响播放器播放, 播放器不属于任何一个路由, 因而将播放器放在app.vue下  -->
      <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from './components/player/player'
export default {
  name: 'App',
  components: {
    Player,
    MHeader,
    Tab
  }
}
</script>

<style scoped lang="stylus">
  @import '~common/stylus/variable.styl'
  #app
    color: $color-theme
</style>
