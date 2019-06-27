<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import {getMusicList} from 'api/rank'
import MusicList from '../music-list/music-list'
import {mapGetters} from 'vuex'
import {ERR_OK} from 'api/config'

export default {
  computed: {
    title () {
      return this.topList.topTitle
    },
    bgImage () {
      return this.topList.picUrl
    },
    songs () {
      return this.topList.songList
    },
    ...mapGetters([
      'topList'
    ])
  },
  created () {
    console.log('开始获取排行详情页')
    this._getMusicList()
  },
  methods: {
    _getMusicList () {
      getMusicList(this.topList.id).then((res) => {
        if (res.code === ERR_OK) {
          console.log('详情页' + JSON.stringify(res))
        }
      })
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
