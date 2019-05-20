import {commonParams} from './config'
import axios from 'axios'
// import jsonp from 'common/js/jsonp'

export function getTopList () { // 获取"排行"列表
  // const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'
  const url = '/api/getTopList'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5',
    g_tk: 5381,
    _: 1558087958875,
    format: 'json'
  })
  // return jsonp(url, data, options)
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  }).catch((error) => {
    console.log(error)
  })
}
