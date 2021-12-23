import request from '@/utils/request'

export function pageScore(query) {
  return request({
    url: '/sys/score/page',
    method: 'get',
    params: query
  })
}

// 删除
export function delScore(data) {
  return request({
    url: '/sys/score/btc',
    method: 'delete',
    params: data
  })
}

// 批量删除
export function btcScore(data) {
  return request({
    url: '/sys/score/btc',
    method: 'delete',
    params: data
  })
}

// 新增
export function createScore(data) {
  return request({
    url: '/sys/score/',
    method: 'post',
    data
  })
}

// 修改
export function updateScore(data) {
  return request({
    url: '/sys/score/',
    method: 'put',
    data
  })
}
