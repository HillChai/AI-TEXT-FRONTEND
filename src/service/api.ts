import axios, { type AxiosInstance } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000', //后端服务地址
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const prompt: string =
  '请根据以下结构回答问题：\n \
  1. 简要回应问题，明确目标和原则。\n \
  2. 详细展开行动方案，每个要点不超过 3 行，逻辑清晰，层次分明。\n \
  3. 引用相关政策或讲话作为支持性论据，不要显得刻意。\n \
  4. 使用朴实流畅的语言，控制答案在 250-300 字范围内，时长约 3 分钟。 \n \
  问题是：'

export default api
