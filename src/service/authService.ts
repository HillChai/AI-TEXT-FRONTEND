import api from './api' // 导入已经配置好的 Axios 实例

// 用户注册
export const register = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/register', { username, password })
    return response.data // 返回注册成功的用户信息
  } catch (error) {
    console.error('注册失败:', error)
    throw error // 抛出错误供调用者处理
  }
}

// 用户登录
export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { username, password })
    return response.data // 返回包含 access_token 的对象
  } catch (error) {
    console.error('登录失败:', error)
    throw error // 抛出错误供调用者处理
  }
}


/**
 * 获取用户详情
 * @param userId 用户 ID
 * @returns 用户详情
 */
export const fetchUserInfo = async (userId: number) => {
  try {
    const response = await api.get(`/auth/${userId}`)
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}