import Vue from 'vue'
import Router from 'vue-router'
import Rank from '../components/rank/rank'
import Singer from '../components/singer/singer'
import Recommend from '../components/recommend/recommend'
import Search from '../components/search/search'
import SingerDetail from '../components/singer-detail/singer-detail'
import Disc from '../components/disc/disc'
import TopList from '../components/top-list/top-list'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/rank',
      name: 'Rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/singer',
      name: 'Singer',
      component: Singer,
      children: [
        {
          // ':id' :表示变量  传入不同的id，跳转至不同的子路由
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/recommend',
      name: 'Recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/search',
      name: 'Search',
      component: Search
    }
  ]
})
