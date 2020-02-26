import request from '@/utils/request'

// 查询数据库管理列表
export function listDatabase(query) {
  return request({
    url: '/mnt/database/list',
    method: 'get',
    params: query
  })
}

// 查询数据库管理详细
export function getDatabase(id) {
  return request({
    url: '/mnt/database/' + id,
    method: 'get'
  })
}

// 新增数据库管理
export function addDatabase(data) {
  return request({
    url: '/mnt/database',
    method: 'post',
    data: data
  })
}

// 修改数据库管理
export function updateDatabase(data) {
  return request({
    url: '/mnt/database',
    method: 'put',
    data: data
  })
}

// 删除数据库管理
export function delDatabase(id) {
  return request({
    url: '/mnt/database/' + id,
    method: 'delete'
  })
}

// 导出数据库管理
export function exportDatabase(query) {
  return request({
    url: '/mnt/database/export',
    method: 'get',
    params: query
  })
}

// 测试数据库连接
export function testDbConnect(data) {
  return request({
    url: '/mnt/database/testConnect',
    method: 'post',
    data
  })
}

// 上传执行脚本
export function uploadExecute(data) {
  return request({
    url: '/mnt/database/upload',
    method: 'post',
    data
  })
}
