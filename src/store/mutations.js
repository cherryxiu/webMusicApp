import * as types from './mutation-types'

const mutations = {
  // [方法名](state.js里的state方法，state方法里的state变量){修改操作}
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  }
}
export default mutations
