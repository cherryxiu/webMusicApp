import {playMode} from 'common/js/config'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [], // 播放list  需要上一首,下一首跳转
  sequenceList: [], // 顺序列表(支持多种播放模式)
  mode: playMode.sequence,
  currentIndex: -1, // 当前播放歌曲索引
  disc: {}
}

export default state
