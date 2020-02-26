import request from '@/utils/request'

// 查询服务器管理列表
export function listServer(query) {
    return request({
        url: '/mnt/server/list',
        method: 'get',
        params: query
    })
}

// 查询服务器管理详细
export function getServer(id) {
    return request({
        url: '/mnt/server/' + id,
        method: 'get'
    })
}

// 新增服务器管理
export function addServer(data) {
    return request({
        url: '/mnt/server',
        method: 'post',
        data: data
    })
}

// 修改服务器管理
export function updateServer(data) {
    return request({
        url: '/mnt/server',
        method: 'put',
        data: data
    })
}

// 删除服务器管理
export function delServer(id) {
    return request({
        url: '/mnt/server/' + id,
        method: 'delete'
    })
}

// 导出服务器管理
export function exportServer(query) {
    return request({
        url: '/mnt/server/export',
        method: 'get',
        params: query
    })
}

// 测试服务器连接
export function testServerConnect(data) {
  return request({
    url: '/mnt/server/testConnect',
    method: 'post',
    data
  })
}

// 查询服务器下拉选
export function queryServerSelect() {
  return request({
    url: '/mnt/server/queryServerSelect',
    method: 'get'
  })
}
