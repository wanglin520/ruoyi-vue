import request from '@/utils/request'

// 分页获取Redis数据
export function getRedisData(query) {
  return request({
    url: '/monitor/redis/list',
    method: 'get',
    params: query
  })
}

// 通过key获取Redis信息
export function getRedisByKey(key) {
  return request({
    url: '/monitor/redis/getByKey/' + key,
    method: 'get',
  })
}

// 获取Redis键值数量
export function getRedisKeySize(params) {
  return request({
    url: '/monitor/redis/getKeySize',
    method: 'get',
    params: params
  })
}

// 获取Redis内存
export function getRedisMemory(params) {
  return request({
    url: '/monitor/redis/getMemory',
    method: 'get',
    params: params
  })
}

// 获取Redis信息
export function getRedisInfo(params) {
  return request({
    url:'/monitor/redis/info',
    method: 'get',
    params: params
  })
}

// 添加编辑Redis
export function saveRedis(params) {
  return request({
    url: '/monitor/redis/save',
    method: 'post',
    data: params
  })
}

// 删除Redis
export function deleteRedis(keys) {
  return request({
    url: '/monitor/redis/delByKeys/' + keys,
    method: 'delete'
  })
}

// 清空Redis
export function deleteAllRedis() {
  return request({
    url: '/monitor/redis/delAll',
    method: 'delete'
  })
}
