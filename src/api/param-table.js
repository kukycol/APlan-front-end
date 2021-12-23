import request from '@/utils/request'

export function pageParam(query) {
  return request({
    url: '/sys/param/page',
    method: 'get',
    params: query
  })
}

// 删除
export function delParam(data) {
  return request({
    url: '/sys/param/btc',
    method: 'delete',
    params: data
  })
}

// 批量删除
export function btcParam(data) {
  return request({
    url: '/sys/param/btc',
    method: 'delete',
    params: data
  })
}

// 新增
export function createParam(data) {
  return request({
    url: '/sys/param/',
    method: 'post',
    data
  })
}

// 修改
export function updateParam(data) {
  return request({
    url: '/sys/param/',
    method: 'put',
    data
  })
}
