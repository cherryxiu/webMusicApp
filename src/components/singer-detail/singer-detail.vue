<template>
  <transition name="slide">
    <!--<div class="singer-detail"></div>-->
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {createSong} from '../../common/js/song'
import {mapGetters} from 'vuex'
import {getSingerDetail} from 'api/singer'
import {ERR_OK} from 'api/config'
export default {
  data () {
    return {
      songs: []
    }
  },
  computed: {// 用来监控自己定义的变量,双向绑定或者数据处理
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.avatar
    },
    ...mapGetters([
      'singer' // mutation的数据传递  对应到getters.js的singer
    ])
  },
  created () {
    console.log('跳转的singer为=======' + JSON.stringify(this.singer))
    this._getSingerDetail()
  },
  methods: {
    _getSingerDetail () {
      if (!this.singer.id) { // 如果没有singerId，就回跳到原本singer页
        this.$router.push('/singer')
        return
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          console.log(JSON.stringify(res))
          this.songs = this._normalizeSongs(res.data.list)
        }
      })
    },
    _normalizeSongs (list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item// 对象的解构赋值
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable.styl"
  .singer-detail
    position : fixed
    z-index : 100
    top : 0
    left : 0
    right : 0
    bottom : 0
    background : $color-background

  .slide-enter-active,.slide-leave-active
    transition: all 0.3s

  .slide-enter,.slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
