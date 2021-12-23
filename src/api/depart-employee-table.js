import request from '@/utils/request'

export function ListDepartEmployee(query) {
  return request({
    url: '/sys/score/getDepartEmployees',
    method: 'get'
    // params: query
  })
}

export function getActivityStatus() {
  return request({
    url: '/sys/score/getActivityStatus',
    method: 'get'
    // params: query
  })
}

// 新增
export function createDepartEmployee(data) {
  return request({
    url: '/sys/score/submitDepartEmployees',
    method: 'post',
    data
  })
}

// 新增
export function updateActivity() {
  return request({
    url: '/sys/score/updateStatus',
    method: 'put'
  })
}

