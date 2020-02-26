import request from '@/utils/request'

// 查询应用管理列表
export function listApp(query) {
    return request({
        url: '/mnt/app/list',
        method: 'get',
        params: query
    })
}

// 查询应用管理详细
export function getApp(id) {
    return request({
        url: '/mnt/app/' + id,
        method: 'get'
    })
}

// 新增应用管理
export function addApp(data) {
    return request({
        url: '/mnt/app',
        method: 'post',
        data: data
    })
}

// 修改应用管理
export function updateApp(data) {
    return request({
        url: '/mnt/app',
        method: 'put',
        data: data
    })
}

// 删除应用管理
export function delApp(id) {
    return request({
        url: '/mnt/app/' + id,
        method: 'delete'
    })
}

// 导出应用管理
export function exportApp(query) {
    return request({
        url: '/mnt/app/export',
        method: 'get',
        params: query
    })
}

// 查询应用下拉选
export function queryAppSelect() {
  return request({
    url: '/mnt/app/queryAppSelect',
    method: 'get'
  })
}
