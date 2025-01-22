import api from './api'

export const fetchGPTResponse = async (
  text: string,
  promptId: number,
  user_id: number,
): Promise<string> => {
  try {
    const response = await api.post('/gpt/', {
      question_content: text,
      prompt_id: promptId,
      user_id: user_id,
    });

    const data = response.data;
    if (data.status === 'success' && data.result) {
      return data.result;
    } else {
      throw new Error(data.detail || 'Unexpected API response');
    }
  } catch (error: any) {
    console.error('Error in fetchGPTResponse:', error);

    if (error.response) {
      throw new Error(`服务端错误：${error.response.data?.detail || '未知错误'}`);
    } else if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后再试。');
    } else if (error.request) {
      throw new Error('网络错误，请检查您的网络连接。');
    } else {
      throw new Error('发生未知错误，请稍后再试。');
    }
  }
};
