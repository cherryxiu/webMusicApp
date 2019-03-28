<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!-- .prevent - 调用 event.preventDefault() 即取消事件的默认动作。手机浏览器可能有自带滚动功能-->
      <div class="progress-btn-wrapper" ref="progressBtn"
            @touchstart.prevent="progressTouchStart"
            @touchmove.prevent="progressTouchMove"
            @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {prefixStyle} from 'common/js/dom'
const transform = prefixStyle('transform')

const progressBtnWidth = 16
export default {
  name: 'progress-bar',
  props: {
    percent: { // 从父组件传来的percent
      type: Number,
      default: 0
    }
  },
  created () {
    this.touch = {} // 创建touch对象,将不同回调里需要共享的数据挂载到这个对象上
  },
  methods: {
    progressTouchStart (e) {
      this.touch.initiated = true //  初始化touch对象
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth // 滑动开始时进度条的偏移量
    },
    progressTouchMove (e) {
      if (!this.touch.initiated) { // touch对象没有初始化成功
        return
      }
      const deltaX = e.touches[0].pageX - this.touch.startX // 计算出手滑动的距离
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX)) // 避免手滑动距离超过总进度条范围
      this._offset(offsetWidth)
    },
    progressTouchEnd (e) {
      this.touch.initiated = false
      this._triggerPercent()
    },
    progressClick (e) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      // 这里当我们点击 progressBtn 的时候，e.offsetX 获取不对
      // this._offset(e.offsetX)
      this._triggerPercent()
    },
    _triggerPercent () { // 修改音乐的播放进程
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth // 滑动后的新percent, 调整歌曲播放的进度
      this.$emit('percentChange', percent)
    },
    _offset (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px` // 进度条高亮
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)` // 图标需要根据播放进度移动
    }
  },
  watch: {
    percent (newPercent) {
      const progressBarWidth = this.$refs.progressBar.clientWidth - progressBtnWidth // 要扣除图标的宽度
      const offsetWidth = newPercent * progressBarWidth // 进度条的偏移量
      this._offset(offsetWidth)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
