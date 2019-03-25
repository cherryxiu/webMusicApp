<template>
  <div class="progress-bar" ref="progressBar">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn">
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
  watch: {
    percent (newPercent) {
      const progressBarWidth = this.$refs.progressBar.clientWidth - progressBtnWidth // 要扣除图标的宽度
      const offsetWidth = newPercent * progressBarWidth // 进度条的偏移量
      this.$refs.progress.style.width = `${offsetWidth}px` // 进度条高亮
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)` // 图标需要根据播放进度移动
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
