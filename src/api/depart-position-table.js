import request from '@/utils/request'

export function pagePosition(query) {
  return request({
    url: '/sys/depart/position/page',
    method: 'get',
    params: query
  })
}

export function listPosition(departId) {
  console.log(departId)
  return request({
    url: '/sys/depart/position/list/' + departId,
    method: 'get'
    // params: query
  })
}

export function delPosition(id) {
  return request({
    url: '/sys/depart/position/btc',
    method: 'delete',
    params: { id }
  })
}

export function btcPosition(data) {
  return request({
    url: '/sys/depart/position/btc',
    method: 'delete',
    params: data
  })
}

export function createPosition(data) {
  return request({
    url: '/sys/depart/position/',
    method: 'post',
    data
  })
}

export function updatePosition(data) {
  return request({
    url: '/sys/depart/position/',
    method: 'put',
    data
  })
}
