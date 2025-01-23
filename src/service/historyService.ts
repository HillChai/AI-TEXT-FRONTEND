import api from '@/service/api'

// 获取历史记录接口类型定义
interface Question {
  id: number // 问题的唯一标识
  question_content: string // 问题的内容
  answer_content: string | null // 答案的内容，可能为空
  user_id: number // 提问用户的 ID
  prompt_id: number | null // 提示的 ID，可能为空
  created_at: string // 问题创建时间（ISO 格式字符串）
  updated_at: string // 问题更新时间（ISO 格式字符串）
}

export interface HistoryItem {
  date: string // 日期（格式 YYYY-MM-DD）
  questions: Question[] // 当天的问题列表
}

// API 请求的端点
const API_ENDPOINTS = {
  HISTORY: '/questions/history',
}

// 定义 fetchQuestionHistory 方法
export const fetchQuestionHistory = async (
  page: number = 1,
  limit: number = 10,
): Promise<HistoryItem[]> => {
  try {
    const response = await api.get<HistoryItem[]>(API_ENDPOINTS.HISTORY, {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    console.error('加载历史记录失败:', error)
    throw error
  }
}

// 更新问题或答案内容的接口
export const updateQuestionOrAnswer = async (
  id: number,
  updates: { question_content?: string; answer_content?: string },
): Promise<void> => {
  try {
    await api.put(`/questions/${id}`, updates)
    console.log('更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    throw error
  }
}

export const updateByContent = async (updates: {
  original_content: string // 原始内容，用于查找
  question_content?: string // 新的提问内容
  answer_content?: string // 新的答案内容
}): Promise<{ question_id: number; message: string }> => {
  try {
    console.log('更新请求参数:', updates)

    const response = await api.put('/questions/update-by-original-content', updates)
    console.log('根据内容更新成功', response.data)
    return response.data // 返回后端的响应数据
  } catch (error) {
    console.error('根据内容更新失败:', error)
    throw error // 抛出错误让调用者处理
  }
}
