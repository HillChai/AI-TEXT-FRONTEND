// import api, { prompt } from './api'
import api from './api'

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout = 30000, //30s
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timed out')), timeout)
    fetch(url, options)
      .then((response) => {
        clearTimeout(timer)
        resolve(response)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

/**
 * 调用 GPT 接口获取回复
 * @param {string} text - 用户输入
 * @param {number} promptId - GPT 提示词
 * @param {number} username - 用户Id
 * @returns {Promise<string>} - GPT 的回复
 */
export const fetchGPTResponse = async (
  text: string,
  promptId: number,
  user_id: number,
): Promise<string> => {
  try {
    const url = '/gpt'
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_content: text,
        prompt_id: promptId,
        user_id: user_id,
      }),
    }

    const response = await fetchWithTimeout(api.defaults.baseURL + url, options, 10000)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.status === 'success' && data.result) {
      return data.result
    } else {
      throw new Error(data.detail || 'Unexpected API response')
    }
  } catch (error: any) {
    console.error('Error in fetchGPTResponse:', error)

    if (error.response) {
      throw new Error(`服务端错误：${error.response.data?.detail || '未知错误'}`)
    } else if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后再试。')
    } else if (error.request) {
      throw new Error('网络错误，请检查您的网络连接。')
    } else {
      throw new Error('发生未知错误，请稍后再试。')
    }
  }
}
