<template>
  <div class="rank">
    <ul>
      <li>
        <div class="icon">
          <img width="100" height="100"/>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {getTopList} from 'api/rank'
export default {
  created () {
    this._getTopList()
  },
  methods: {
    _getTopList () {
      getTopList().then((res) => {
        console.log('topList为' + JSON.stringify(res))
      })
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
