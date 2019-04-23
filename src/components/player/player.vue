<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                 @enter="enter"
                 @after-enter="afterEnter"
                 @leave="leave"
                 @after-leave="afterLeave">
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img width="100%" height="100%" :src="currentSong.image"/>
      </div>
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <div class="middle"
           @touchstart.prevent="middleTouchStart"
           @touchmove.prevent="middleTouchMove"
           @touchend.prevent="middleTouchEnd">
        <div class="middle-l" ref="middleL">
          <div class="cd-wrapper" ref="cdWrapper">
            <div class="cd" :class="cdCls">
              <img class="image" :src="currentSong.image">
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
        <!-- 显示全部歌词 -->
        <!-- :data 先判断currentLyric是否为null,不为空则取lines -->
        <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
          <div class="lyric-wrapper">
            <div v-if="currentLyric">
              <!-- :class 布尔值的绑定方式,"currentLineNum===index"为true时才增加 current 样式-->
              <p ref="lyricLine"
                 class="text"
                 :class="{'current':currentLineNum === index}"
                 v-for="(line, index) in currentLyric.lines" v-bind:key="index">{{line.txt}}</p>
            </div>
          </div>
        </scroll>
      </div>
      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
          <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
        </div>
        <div class="progress-wrapper">
          <span class="time time-l">{{format(currentTime)}}</span>
          <div class="progress-bar-wrapper">
            <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
          </div>
          <span class="time time-r">{{format(currentSong.duration)}}</span>
        </div>
        <div class="operators">
          <div class="icon i-left">
            <i :class="iconMode" @click="changeMode"></i>
          </div>
          <div class="icon i-left" :class="disableCls">
            <i @click="prev" class="icon-prev"></i>
          </div>
          <div class="icon i-center" :class="disableCls">
            <i @click="togglePlaying" :class="playIcon"></i>
          </div>
          <div class="icon i-right" :class="disableCls">
            <i @click="next" class="icon-next"></i>
          </div>
          <div class="icon i-right">
            <i class="icon icon-not-favorite"></i>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <transition>
    <div class="mini-player" v-show="!fullScreen" @click="open">
      <div class="icon">
        <img  width="40" height="40" :src="currentSong.image" :class="cdCls"/>
      </div>
      <div class="text">
        <h2 class="name" v-html="currentSong.name"></h2>
        <p class="desc" v-html="currentSong.singer"></p>
      </div>
      <div class="control">
        <progress-circle :radius="radius" :percent="percent">
          <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
        </progress-circle>
      </div>
      <div class="control">
        <i class="icon-playlist"></i>
      </div>
    </div>
    </transition>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import {mapGetters, mapMutations} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
export default{
  data () {
    return {
      songReady: false,
      currentTime: 0, // 歌曲播放到的时间
      radius: 32, // 避免type check failed [若直接用`radius=32传递,组件会将32变成string型,子组件props接收时会异常`]
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    cdCls () { // playing改变,icdWrapper的旋转也改变
      return this.playing ? 'play' : 'play pause'
    },
    playIcon () { // playing改变,icon也改变
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () { // playing改变,mini-icon也改变
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls () { // 当domException时,按钮会暂时变灰,不能使用
      return this.songReady ? '' : 'disable'
    },
    percent () { // 计算歌曲播放比率
      return this.currentTime / this.currentSong.duration
    },
    iconMode () { // 播放模式
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([ // 这里是数组,中括号,不是大括号
      'fullScreen',
      'playlist',
      'currentSong',
      'playing', // 播放状态
      'currentIndex',
      'mode',
      'sequenceList' // 在cd页面显示的歌词
    ])
  },
  created () {
    this.touch = {} // 初始化touch对象
  },
  methods: {
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    enter (el, done) { // 设置过渡进入完成时的组件状态
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear' // 匀速
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () { // 设置过渡进入完成之后的组件状态
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) { // 设置过渡离开完成时地组件状态
      this.$refs.cdWrapper.style.transition = 'all 0.4s' // 所有转变0.4s
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () { // 设置过渡离开完成之后的组件状态
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) { // 解决暂停播放时, 歌词继续滚动问题
        this.currentLyric.togglePlay()
      }
    },
    prev () {
      if (!this.songReady) { // 切换还没准备好.songReady该没被改成true,避免DOMException
        return
      }
      if (this.playlist.length === 1) { // 防止特殊情况发生
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) { // 如果是第一首, 就跳转到最后一首
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) { // 当前歌曲暂停时,将切换后的歌曲playing重新改为true,使跳转后的歌曲icon改为play[因为跳转后的歌曲自动播放]
          this.togglePlaying()
        }
      }
      this.songReady = false // 完成之后恢复数据初始
    },
    next () {
      if (!this.songReady) { // 上同,避免DOMException
        return
      }
      if (this.playlist.length === 1) { // 防止特殊情况发生
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) { // 如果是最后一首, 就跳转到第一首
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) { // 上同,使跳转后的歌曲icon改为play
          this.togglePlaying()
        }
      }
      this.songReady = false // 完成之后恢复数据初始
    },
    ready () {
      this.songReady = true
    },
    error () {
      this.songReady = true
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    format (interval) { // 将时间戳转换成 分:秒
      interval = interval | 0 // 取整
      const minite = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minite}:${second}`
    },
    onProgressBarChange (newPercent) {
      const currentTime = this.currentSong.duration * newPercent
      this.$refs.audio.currentTime = currentTime // 根据滑动改变音乐播放
      if (!this.playing) { // 在暂停时点击进度条, 使歌曲保播放状态
        this.togglePlaying()
      }
      if (this.currentLyric) { // 滑动进度条时, 歌词高亮也随之变动
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    changeMode () {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList) // 将歌曲变成随机列表
        this.setSequenceList(list)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    resetCurrentIndex (list) { // 保持当前播放歌曲不变
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      this.$refs.audio.currentTime = 0 // 单曲循环就是将currentTime设置为0
      this.$refs.audio.play() // 循环时继续播放
      if (this.currentLyric) { // 播放结束时,将歌词播放重置
        this.currentLyric.seek(0)
      }
    },
    getLyric () {
      this.currentSong.getLyric().then((lyric) => { // 获取歌词
        console.log(new Lyric(lyric))
        this.currentLyric = new Lyric(lyric, this.handleLyric) // 利用lyric-parser将lyric解析成Lyric对象
        this.currentLyric.play()
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum
      if (lineNum > 5) { // 歌词滚动高亮
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaX) < Math.abs(deltaY)) { // 歌词有个纵向scroll, 所以如果Y向移动大于X向移动,则return
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth // 指的应该是middle-r的左边,控制middle-r模块
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX)) // 页面显示的lyric所占距离
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth) // 页面显示lyric所占比例
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)` // $el 是要取到它的元素      this.$refs.lyricList.$el.style[transitionDuration] = 0 // 过渡所需时间
      this.$refs.middleL.style.opacity = 1 - this.touch.percent // lyric页面显示越多, middleL越暗淡
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd (e) {
      let offsetWidth // 控制middle-r的偏移
      let opacity // 控制middle-l的透明度
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) { // 切换页面到lyric
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if (this.touch.percent < 0.9) { // 切换页面到cd
          offsetWidth = 0
          opacity = 1
          this.currentShow = 'cd'
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
    },
    _getPosAndScale () {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    _pad (num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setSequenceList: 'SET_SEQUENCE_LIST',
      setPlayList: 'SET_PLAYLIST'
    })
  },
  watch: {
    currentSong (newSong, oldSong) {
      if (newSong.id === oldSong.id) { // 当歌曲暂停播放,切换随机模式时,仍然播放[因为虽然歌曲id没变,但currenSong是改变了的]
        return
      }
      if (this.currentLyric) { // 切换歌曲时,在或许新的lyric之前,清除当前歌曲的计时器
        this.currentLyric.stop()
      }
      setTimeout(() => { // 保证歌曲从后台切换到浏览器时,能正常播放
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
    playing (newPlaying) { // 监听playing播放状态来控制音乐是否播放
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play // 歌曲播放时旋转
                animation: rotate 20s linear infinite
              &.pause // 歌曲暂停时静止
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play // 歌曲播放时旋转
            animation: rotate 10s linear infinite
          &.pause // 歌曲暂停时静止
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
