import axios, { type AxiosInstance } from 'axios'

// 创建 Axios 实例
const api: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000', //后端服务地址
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // 仅通过 JWT Header 验证
})


// 判断 Token 是否过期
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp && Date.now() > payload.exp * 1000
  } catch (e) {
    return true
  }
}


// 请求拦截器，动态添加 JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      if (isTokenExpired(token)) {
        // Token 已过期
        localStorage.removeItem('access_token')
        window.location.href = '/login'
        return Promise.reject(new Error('Token expired'))
      }
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器，统一处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)


export const prompt: string =
  '请根据以下结构回答问题：\n \
  1. 简要回应问题，明确目标和原则。\n \
  2. 详细展开行动方案，每个要点不超过 3 行，逻辑清晰，层次分明。\n \
  3. 引用相关政策或讲话作为支持性论据，不要显得刻意。\n \
  4. 使用朴实流畅的语言，控制答案在 250-300 字范围内，时长约 3 分钟。 \n \
  问题是：'

export default api
