import request from '@/utils/request'

// 分页查询
export function pageOnline(query) {
  return request({
    url: '/sys/user/online/page',
    method: 'get',
    params: query
  })
}

// 强制退出
export function quit(keys) {
  return request({
    url: '/sys/user/online/quit/',
    method: 'delete',
    params: keys
  })
}

