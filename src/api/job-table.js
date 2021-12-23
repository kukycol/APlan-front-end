import request from '@/utils/request'

// 分页查询
export function pageJob(query) {
  return request({
    url: '/sys/schedule/page',
    method: 'get',
    params: query
  })
}

// 删除
export function delJob(data) {
  return request({
    url: '/sys/schedule/btc',
    method: 'delete',
    params: data
  })
}

// 批量删除
export function btcJob(data) {
  return request({
    url: '/sys/schedule/btc',
    method: 'delete',
    params: data
  })
}

// 新增
export function createJob(data) {
  return request({
    url: '/sys/schedule/',
    method: 'post',
    data
  })
}

// 立即执行
export function runJob(data) {
  return request({
    url: '/sys/schedule/run',
    method: 'post',
    data
  })
}

// 修改
export function updateJob(data) {
  return request({
    url: '/sys/schedule/',
    method: 'put',
    data
  })
}

// 暂停和恢复
export function updateStatusJob(data) {
  return request({
    url: '/sys/schedule/updateStatus',
    method: 'put',
    data
  })
}
