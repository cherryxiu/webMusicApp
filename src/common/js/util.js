function getRandomInt (min, max) { // 落在min和max之间返回,并且可以包括min,max
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (arr) { // 随机播放的list
  let _arr = arr.slice() // 取arr的副本, 避免直接修改arr
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}
