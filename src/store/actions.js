// 异步操作  调用一个action,可以调用多个mutation
import * as types from './mutation-types'

export const selectPlay = function ({commit, state}, {list, index}) { // 选择播放函数
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
