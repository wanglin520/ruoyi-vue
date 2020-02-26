import request from '@/utils/request'

// 查询定时任务调度列表
export function listJob(query) {
    return request({
        url: '/tool/job/list',
        method: 'get',
        params: query
    })
}

// 查询定时任务调度详细
export function getJob(jobId) {
    return request({
        url: '/tool/job/' + jobId,
        method: 'get'
    })
}

// 新增定时任务调度
export function addJob(data) {
    return request({
        url: '/tool/job',
        method: 'post',
        data: data
    })
}

// 修改定时任务调度
export function updateJob(data) {
    return request({
        url: '/tool/job',
        method: 'put',
        data: data
    })
}

// 删除定时任务调度
export function delJob(jobId) {
    return request({
        url: '/monitor/job/' + jobId,
        method: 'delete'
    })
}

// 导出定时任务调度
export function exportJob(query) {
    return request({
        url: '/tool/job/export',
        method: 'get',
        params: query
    })
}

// 修改定时任务调度状态
export function updateJobStatus(id, isPause) {
  const data = {
    id,
    isPause
  }
  return request({
    url: '/tool/job/updateIsPause',
    method: 'put',
    data: data
  })
}

// 校验cron表达式
export function checkCronExpressionIsValid(cronExpression) {
  const data = {
    cronExpression
  }
  return request({
    url: '/tool/job/checkCronExpressionIsValid',
    method: 'post',
    data: data
  })
}

// 启动定时任务
export function runJob(id) {
  return request({
    url: '/tool/job/run/' + id,
    method: 'get'
  })
}
