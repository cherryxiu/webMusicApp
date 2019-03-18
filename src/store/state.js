import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [], // 播放list  需要上一首,下一首跳转
  sequenceList: [], // 顺序列表(支持多种播放模式)
  mode: playMode.sequence,
  currentIndex: -1, // 当前播放歌曲索引
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
}

export default state
