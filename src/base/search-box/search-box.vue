<template>
    <div class="search-box">
      <i class="icon-search"></i>
      <input class="box" v-model="query" :placeholder="placeholder"/>
      <i class="icon-dismiss" v-show="query" @click="clear"></i>
    </div>
</template>

<script>
export default {
  name: 'search-box',
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲.歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    clear () {
      this.query = ''
    },
    setQuery (query) { // 点击'热门搜索'的歌曲时,搜索框文案填充
      this.query = query
    }
  },
  created () { // 派发一个query(将query的值暴露给外面)
    this.$watch('query', (newQuery) => {
      this.$emit('query', newQuery)
    })
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
.search-box
  display: flex
  align-items: center
  box-sizing: border-box
  width: 100%
  padding: 0 6px
  height: 20px
  background: $color-highlight-background
  border-radius: 6px
  .icon-search
    font-size: 24px
    color: $color-dialog-background
  .box
    flex: 1
    margin: 0 5px
    line-height: 18px
    background: $color-highlight-background
    color: $color-text
    font-size: $font-size-medium
    &::placeholder
      color: $color-text-d
  .icon-dismiss
    font-size: 16px
    color:$color-dialog-background
</style>
