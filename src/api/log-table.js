import request from '@/utils/request'

export function fetchPageList(query) {
  return request({
    url: '/sys/log/page',
    method: 'get',
    params: query
  })
}
