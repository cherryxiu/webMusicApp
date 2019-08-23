<template>
<div class="music-list" ref="singer">
  <div class="back" @click="back">
    <i class="icon-back"></i>
  </div>
  <h1 class="title" v-html="title"></h1>
  <div class="bg-image" :style="bgStyle" ref="bgImage">
    <div class="play-wrapper">
      <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
    </div>
    <div class="filter" ref="filter"></div>
  </div>
  <div class="bg-layer" ref="layer"></div><!-- 当scroll滑动时,也跟着移动-->
  <scroll :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" @scroll="scroll" class="list" ref="list">
    <div class="song-list-wrapper">
      <song-list :songs="songs" :rank="rank" @select="selectItem"></song-list>
    </div>
    <div v-show="!songs.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</div>
</template>

<script type="text/ecmascript-6">
import SongList from 'base/song-list/song-list'
import Scroll from 'base/scroll/scroll'
import {prefixStyle} from 'common/js/dom'
import Loading from '../../base/loading/loading'
import {mapActions} from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')

export default{
  name: 'music-list',
  mixins: {playlistMixin},
  props: {// 子组件使用父组件的数据，需要通过子组件的 props 选项
    bgImage: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: null
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollY: 0
    }
  },
  computed: {
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    }
  },
  created () {
    this.probeType = 3
    this.listenScroll = true // 监听滚动
  },
  mounted () { // 钩子函数, 在所有函数执行前，我先执行了的函数
    this.imageHeight = this.$refs.bgImage.clientHeight // 图片的高度, 也是bg-player的最大滑动距离
    this.minTransaltey = -this.imageHeight + RESERVED_HEIGHT
    this.$refs.list.$el.style.top = `${this.imageHeight}px`// list列表的初始化高度
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    scroll (pos) { // 获取song-list滑动的距离
      this.scrollY = pos.y
    },
    back () {
      this.$router.back()
    },
    selectItem (item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    // 监测 scrollY 的变化
    scrollY (newVal) {
      let translateY = Math.max(this.minTransaltey, newVal)
      let zIndex = 0
      let scale = 1
      let blur = 0
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      const percent = Math.abs(newVal / this.imageHeight)
      if (newVal > 0) { //  newVal>0实现下滑后出现图片放大的特效
        scale = 1 + percent
        zIndex = 10
      } else { // newVal<=0实现图片模糊的效果
        blur = Math.min(20, percent * 20)
      }
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
      if (newVal < this.minTransaltey) { // newVal<0 当往上滑动到顶时,更改图片的zIndex, padding-top, height,
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        this.$refs.playBtn.style.display = 'none'
      } else { // newVal<0 下拉时恢复图片样式
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = `0px`
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImage.style[transform] = `scale(${scale})`
      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  components: {
    Loading,
    SongList,
    Scroll
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
