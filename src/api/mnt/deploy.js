import request from '@/utils/request'

// 查询部署管理列表
export function listDeploy(query) {
    return request({
        url: '/mnt/deploy/list',
        method: 'get',
        params: query
    })
}

// 查询部署管理详细
export function getDeploy(id) {
    return request({
        url: '/mnt/deploy/' + id,
        method: 'get'
    })
}

// 新增部署管理
export function addDeploy(data) {
    return request({
        url: '/mnt/deploy',
        method: 'post',
        data: data
    })
}

// 修改部署管理
export function updateDeploy(data) {
    return request({
        url: '/mnt/deploy',
        method: 'put',
        data: data
    })
}

// 删除部署管理
export function delDeploy(id) {
    return request({
        url: '/mnt/deploy/' + id,
        method: 'delete'
    })
}

// 导出部署管理
export function exportDeploy(query) {
    return request({
        url: '/mnt/deploy/export',
        method: 'get',
        params: query
    })
}

// 启动服务
export function startDeployServer(data) {
  return request({
    url: '/mnt/deploy/startDeployServer',
    method: 'post',
    data: data
  })
}

// 停止服务
export function stopDeployServer(data) {
  return request({
    url: '/mnt/deploy/stopDeployServer',
    method: 'post',
    data: data
  })
}

// 一键部署
export function uploadDeploy(data) {
  return request({
    url: '/mnt/deploy/uploadDeploy',
    method: 'post',
    data: data
  })
}

// 系统还原
export function restore(data) {
  return request({
    url: '/mnt/deploy/restore',
    method: 'post',
    data: data
  })
}
