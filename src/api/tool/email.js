import request from '@/utils/request'

// 查询邮件列表
export function listEmail(query) {
  return request({
    url: '/tool/email/list',
    method: 'get',
    params: query
  })
}

// 查询邮件数量
export function queryCount() {
  return request({
    url: '/tool/email/count',
    method: 'get'
  })
}

// 删除邮件(移动到垃圾箱)
export function delEmail(id) {
  return request({
    url: '/tool/email/remove/' + id,
    method: 'get'
  })
}

// 彻底删除邮件
export function delCompEmail(id) {
  return request({
    url: '/tool/email/compRemove/' + id,
    method: 'get'
  })
}

// 垃圾邮件恢复
export function recoverEmail(id) {
  return request({
    url: '/tool/email/recover/' + id,
    method: 'get'
  })
}

// 发送邮件
export function sendEmail(data) {
  return request({
    url: '/tool/email/send',
    method: 'post',
    data
  })
}

// 保存为草稿
export function saveDraftEmail(data) {
  return request({
    url: '/tool/email/saveDraftEmail',
    method: 'post',
    data
  })
}

//
export function upload(api, file) {
  var data = new FormData()
  data.append('file', file)
  return request({
    url: api,
    methos: 'post',
    params: data
  })
}

// 查询邮箱配置
export function getEmailConfig() {
  return request({
    url: '/tool/emailconfig/getEmailConfig',
    method: 'get'
  })
}

// 修改邮箱配置
export function updateOrAddConfig(data) {
  return request({
    url: '/tool/emailconfig/updateOrAddConfig',
    data,
    method: 'put'
  })
}


