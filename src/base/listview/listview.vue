<template>
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll"
  >
    <ul>
      <li v-for="(group, index) in data" class="list-group" v-bind:key="index" ref="listGroup">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li v-for="(item,index) in group.items" class="list-group-item" v-bind:key="index">
            <img class="avatar" v-lazy="item.avatar" />
            <span class="name">{{ item.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onshortcutTouchStart" @touchmove.stop.prevent="onshortcutTouchMove">
      <ul>
        <li v-for="(item,index) in shortcutList" v-bind:key="index" :data-index="index" class="item" :class="{'current': currentIndex==index}">{{ item }}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle">
      <h1 class="fixed-title"> {{ fixedTitle }} </h1>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT = 18
export default {
  props: {
    data: {
      type: Array,
      default: null
    }
  },
  created () {
    // 创建一个touch空对象
    this.touch = {}
    // 创建一个监听scroll事件
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  },
  computed: {
    shortcutList () {
      return this.data.map((group) => {
        return group.title
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  data () {
    return {
      scrollY: -1, // 需要观测的实时滚动位置
      currentIndex: 0, // 右侧字母列表中需要高亮的字母位置
      diff: -1
    }
  },
  methods: {
    onshortcutTouchStart (e) {
      let anchorIndex = getData(e.target, 'index')
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onshortcutTouchMove (e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    _scrollTo (index) {
      // 点击时：排除右侧字母的最上面，最下面空余的点击
      if (!index && index !== 0) {
        return
      }
      // 滑动字母列表时： 排除右侧字母的最上面，最下面空余的部分
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight - 2) {
        index = this.listHeight - 2
      }
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    _calculateHeight () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    // 监听 data 的变化
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // 监听scrollY的变化
    scrollY (newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部 newY > 0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 当中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        // 向上滚动 scrollY 的值为负，所以加上负号
        // 若不是 height2 为下限，且在 height1 与 height2 之间
        if (-newY >= height1 && -newY <= height2) {
          this.currentIndex = i
          // 设置 diff
          this.diff = height2 + newY
          console.log('中间移动' + this.currentIndex)
          return
        }
      }
      // 当滚动到底部，且 -newY 大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
      console.log('currentIndex移动' + this.currentIndex)
    }
  },
  components: {
    Scroll
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 0.8
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
