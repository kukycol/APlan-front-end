import request from '@/utils/request'

export function getToken() {
  return request({
    url: '/qiniu/upload/token',
    method: 'get'
  })
}

export function uploadFile(file) {
  return request({
    url: '/sys/file/upload/local',
    method: 'post',
    data: file
  })
}
