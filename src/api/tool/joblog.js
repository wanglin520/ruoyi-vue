import request from '@/utils/request'

// 查询定时任务调度日志列表
export function listLog(query) {
    return request({
        url: '/tool/joblog/list',
        method: 'get',
        params: query
    })
}

// 查询定时任务调度日志详细
export function getLog(jobLogId) {
    return request({
        url: '/tool/joblog/' + jobLogId,
        method: 'get'
    })
}

// 新增定时任务调度日志
export function addLog(data) {
    return request({
        url: '/tool/joblog',
        method: 'post',
        data: data
    })
}

// 修改定时任务调度日志
export function updateLog(data) {
    return request({
        url: '/tool/joblog',
        method: 'put',
        data: data
    })
}

// 删除定时任务调度日志
export function delLog(jobLogId) {
    return request({
        url: '/tool/joblog/' + jobLogId,
        method: 'delete'
    })
}

// 清空定时任务调度日志
export function cleanLog() {
  return request({
    url: '/tool/joblog/clean',
    method: 'delete'
  })
}

// 导出定时任务调度日志
export function exportLog(query) {
    return request({
        url: '/tool/joblog/export',
        method: 'get',
        params: query
    })
}
