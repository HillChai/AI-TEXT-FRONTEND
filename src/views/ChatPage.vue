<template>
  <div class="chat-page">
    <!-- 左侧历史记录 -->
    <div :class="['sidebar', { collapsed: isSidebarCollapsed }]" @scroll="onScroll">
      <div class="sidebar-header">
        <button @click="toggleSidebar" class="toggle-button">
          <!-- 图标旋转 -->
          <span :class="['icon', { rotated: isSidebarCollapsed }]">≡</span>
        </button>

        <!-- 空白占位符 -->
        <div class="spacer"></div>

        <!-- 新建对话图标 -->
        <button @click="createNewChat" class="new-chat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24px"
            height="24px"
          >
            <path d="M3 3h18v18H3z" fill="none" />
            <path
              d="M12 2c-.55 0-1 .45-1 1v8H3c-.55 0-1 .45-1 1s.45 1 1 1h8v8c0 .55.45 1 1 1s1-.45 1-1v-8h8c.55 0 1-.45 1-1s-.45-1-1-1h-8V3c0-.55-.45-1-1-1z"
            />
          </svg>
        </button>
      </div>

      <!-- 历史记录列表 -->
      <ul v-show="!isSidebarCollapsed">
        <li
          class="chat-item"
          v-for="(chat, index) in chatHistory"
          :key="index"
          @click="selectChat(chat)"
          :class="{ active: selectedDate === chat.date }"
        >
          {{ chat.date }}
        </li>
        <!-- <button @click="loadMoreHistory" class="load-more-btn">加载更多</button> -->
      </ul>
    </div>

    <!-- 主对话区域 -->
    <div class="chat-container">
      <!-- 消息显示区域 -->
      <div class="messages" ref="messageContainer">
        <div v-for="(message, index) in messages" :key="index" class="message-container">
          <div
            v-if="!message.isEditing"
            :class="['message', message.role]"
            v-html="marked(message.content)"
          ></div>
          <div
            v-else
            :contenteditable="true"
            :class="['message', message.role, 'editable']"
            @input="updateMessageContent($event, index)"
          >
            {{ message.content }}
          </div>
          <!-- 编辑图标 -->
          <button v-if="!message.isEditing" @click="toggleEditing(index)" class="edit-icon">
            <span :class="{ mirrored: true }">✏️</span>
          </button>
          <div v-else class="edit-actions">
            <button @click="saveMessageContent(index)" class="save-icon">✅</button>
            <button @click="cancelEditing(index)" class="cancel-icon">❌</button>
          </div>
        </div>

        <!-- 加载动画 -->
        <div v-if="isLoading" class="loading-indicator">正在思考...</div>
      </div>

      <!-- 输入框 -->
      <div class="input-container">
        <div class="input-box">
          <input
            v-model="userInput"
            :disabled="isLoading || loadingMessages"
            placeholder="告诉我，你的题目"
            maxlength="200"
          />
          <!-- 发送按钮 -->
          <button @click="sendMessage" :disabled="isLoading" class="send-button">
            <!-- <span class="arrow">↑</span> -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              width="24px"
              height="24px"
            >
              <path d="M12 2L19 10H14V22H10V10H5L12 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 登录图标 -->
    <div class="login-icon" @click="toggleMenu" ref="iconRef">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="24px"
        height="24px"
      >
        <path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        />
      </svg>
    </div>
    <!-- 菜单 -->
    <div v-if="isMenuVisible" class="menu" ref="menuRef" @click.stop>
      <ul>
        <!-- 显示用户名 -->
        <li class="username-display">{{ username }}</li>
        <li class="username-display">剩余可用次数: {{ model_quota }}</li>
        <li class="username-display">{{ membership_type }}会员</li>
        <li @click="onLogout">注销</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, onBeforeUnmount } from 'vue'
import { fetchGPTResponse } from '@/service/gptService'
import { marked } from 'marked'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import {
  fetchQuestionHistory,
  updateByContent,
  updateQuestionOrAnswer,
} from '@/service/historyService'
import type { HistoryItem } from '@/service/historyService'
import { format } from 'date-fns'
import { fetchUserInfo } from '@/service/authService'

// 引入 authStore
const authStore = useAuthStore()

// 响应式状态
const isSidebarCollapsed = ref(false) // 控制侧边栏折叠状态
const isMenuVisible = ref(false) // 菜单可见性
const menuRef = ref<HTMLElement | null>(null) // 菜单的 DOM 引用
const iconRef = ref<HTMLElement | null>(null) // 图标的 DOM 引用

// 从 authStore 中获取数据
const isLoggedIn = computed(() => !!authStore.isAuthenticated) // 是否已登录
const username = computed(() => authStore.userInfo?.username || '已登录') // 显示用户名
// 通过 computed 动态计算 userId
const user_id = computed<number>(() => authStore.userInfo?.user_id || 0)
const model_quota = computed<number>(() => authStore.userInfo?.model_quota || 0)
const membership_type = computed<string>(() => authStore.userInfo?.membership_type || '无')

// 模版选择
const promptId = 1

// 初始化对话内容
const messages = ref<
  {
    id: number
    role: string
    content: string
    original_content: string
    isEditing: boolean
    isQuestion: boolean
  }[]
>([
  {
    id: 0,
    role: 'ai',
    content: '欢迎体验面试题辅导！',
    original_content: '',
    isEditing: false,
    isQuestion: true,
  },
])

// 保存消息内容
const saveMessageContent = async (index: number) => {
  const message = messages.value[index]

  try {
    const updates: {
      original_content: string
      question_content?: string
      answer_content?: string
    } = {
      original_content: message.original_content, // 使用缓存的原始内容
    }

    if (message.isQuestion) {
      updates.question_content = message.content
    } else {
      updates.answer_content = message.content
    }

    let newId = message.id
    if (!message.id || message.id < 1000000000000) {
      // 临时 ID，通过内容更新
      const response = await updateByContent(updates)
      newId = response.question_id // 更新为后端返回的真实 ID
    } else {
      // 实际 ID，直接按 ID 更新
      await updateQuestionOrAnswer(message.id, updates)
    }

    // 更新消息的 ID 和退出编辑模式
    message.id = newId
    message.original_content = message.content // 更新原始内容为新内容
    message.isEditing = false

    console.log('内容保存成功')
  } catch (error) {
    console.error('保存内容失败:', error)
  }
}

// 切换编辑模式
const toggleEditing = (index: number) => {
  const message = messages.value[index]

  if (message.isEditing) {
    // 保存内容
    saveMessageContent(index)
  } else {
    // 进入编辑模式，缓存原始内容
    message.original_content = message.content
    message.isEditing = true
  }
}

const cancelEditing = (index: number) => {
  const message = messages.value[index]
  message.content = message.original_content // 恢复原始内容
  message.isEditing = false // 退出编辑模式
}

// 更新消息内容
const updateMessageContent = (event: InputEvent, index: number) => {
  messages.value[index].content = (event.target as HTMLDivElement).innerText
}

const loadingMessages = ref(false) // 添加响应式变量，用于控制是否在加载消息

loadingMessages.value = true

const createNewChat = () => {
  const newChat = {
    date: format(new Date(), 'yyyy-MM-dd HH:mm'), // 格式化日期
    questions: [],
  }

  chatHistory.value.unshift(newChat) // 将新对话添加到历史记录顶部
  selectedDate.value = newChat.date // 选中新对话
  messages.value = [] // 清空当前消息

  loadingMessages.value = false // 确保可以输入
  console.log('新建对话:', newChat)
}

// 历史记录示例
const userInput = ref('') // 用户输入内容
const isLoading = ref(false) // 是否正在加载

// 获取历史记录
const chatHistory = ref<HistoryItem[]>([]) // 历史记录的响应式数据
const selectedDate = ref('') // 当前选中的日期
const currentPage = ref(1)

// 加载历史记录
const loadHistory = async (limit = 10) => {
  try {

    if (!user_id.value) {
      console.error('Invalid userId:', user_id.value)
      return
    }

    console.log('加载的历史记录数据:', chatHistory.value)
    console.log('currentPage.value:', currentPage.value)
    const data = await fetchQuestionHistory(currentPage.value, limit)

    console.log('后端返回的数据:', data)

    // 按日期降序排序
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    chatHistory.value = data // 更新历史记录
    // console.log('加载到的历史记录:', chatHistory.value)
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 滚动事件处理方法
const onScroll = async (event: Event) => {
  const target = event.target as HTMLElement
  // console.log('scrollTop:', target.scrollTop)
  // console.log('clientHeight:', target.clientHeight)
  // console.log('scrollHeight:', target.scrollHeight)

  // 检查是否滚动到底部
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
    console.log('滚动到底部，加载更多数据')
    await loadMoreHistory() // 调用加载更多历史记录的方法
  }
}

// 切换侧边栏展开和关闭
const toggleSidebar = () => {
  // console.log('isLoggedIn.value: ', isLoggedIn.value)
  if (isLoggedIn.value) isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 模拟生成 AI 回复
const generateAIResponse = (input: string) => {
  return `AI 回复: 我理解你的问题 "${input}"，以下是我的答案！`
}

// 切换到历史记录
const selectChat = (item: HistoryItem) => {
  console.log('当前选中聊天的 questions:', item.questions)

  loadingMessages.value = true // 开始加载消息
  selectedDate.value = item.date // 设置选中日期
  messages.value = [] // 清空消息区域

  // 按创建时间升序加载问题和答案
  const sortedQuestions = item.questions.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  // 将问题和答案转换为带布尔变量的消息对象
  const formattedMessages = sortedQuestions.flatMap((q) => {
    return [
      {
        id: q.id || Date.now(), // 临时 ID
        role: 'user',
        content: q.question_content || '（无问题内容）', // 安全地提供默认值
        isQuestion: true,
      },
      {
        id: q.id || Date.now(),
        role: 'ai',
        content: q.answer_content || '（无答案内容）', // 安全地提供默认值
        isQuestion: false,
      },
    ]
  })

  // console.log('格式化后的消息列表:', formattedMessages)

  // 逐条加载问题和答案
  formattedMessages.forEach((q) => {
    if (q.content) {
      messages.value.push({
        id: q.id,
        role: q.role,
        content: q.content,
        original_content: q.content,
        isEditing: q.isEditing,
        isQuestion: q.isQuestion,
      })
    } else {
      console.warn(`${q.role === 'user' ? '问题' : '答案'}内容为空，跳过加载`)
    }
  })

  loadingMessages.value = false // 加载完成后解锁输入框
}

const loadMoreHistory = async () => {
  try {
    const nextPage = currentPage.value + 1
    console.log("nextPage: ", nextPage)
    // console.log('userId:', userId.value)

    const moreHistory = await fetchQuestionHistory(user_id.value, nextPage, 10)
    if (moreHistory.length === 0) {
      console.log('没有更多历史记录')
      return
    }

    // 合并历史记录并排序
    chatHistory.value = [...chatHistory.value, ...moreHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    currentPage.value = nextPage // 更新当前页码
  } catch (error) {
    console.error('加载更多历史记录失败:', error)
  }
}

// 自动滚动到最新消息
const messageContainer = ref<HTMLDivElement | null>(null)
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim()) {
    console.log('输入不能为空')
    return
  }

  const tempId = Date.now() // 使用当前时间戳作为临时 ID
  const newMessage = {
    id: tempId,
    role: 'user',
    content: userInput.value,
    original_content: '',
    isEditing: false,
    isQuestion: true,
    originalContent: '', // 初始化为空
  }

  messages.value.push(newMessage) // 添加临时消息
  const currentInput = userInput.value
  userInput.value = '' // 清空输入框

  isLoading.value = true // 开启加载状态

  try {
    const aiResponse = await fetchGPTResponse(currentInput, promptId, user_id.value)

    // 添加 AI 回复
    const aiMessage = {
      id: tempId + 1, // 临时 ID，也需要区分
      role: 'ai',
      content: aiResponse,
      original_content: '',
      isEditing: false,
      isQuestion: false,
    }
    messages.value.push(aiMessage)

    // 更新用户数据
    const latestUserInfo = await fetchUserInfo(user_id.value)
    // console.log("latestUserInfo:", latestUserInfo)
    authStore.updateUserInfo(latestUserInfo) // 更新 store 数据
    // console.log('用户数据已更新: ', model_quota)
  } catch (error) {
    console.error('获取 AI 回复失败:', error)
    messages.value.push({
      id: tempId + 2,
      role: 'ai',
      content: '无法获取答案，请稍后再试。',
      original_content: '',
      isEditing: false,
      isQuestion: false,
    })
  } finally {
    isLoading.value = false
    scrollToBottom() // 滚动到最新消息
  }
}

// 切换菜单显示状态
const toggleMenu = () => {
  // console.log('isMenuVisible:', isMenuVisible.value)
  isMenuVisible.value = !isMenuVisible.value
}

// 监听点击事件，判断是否点击到菜单外部
const handleClickOutside = (event: MouseEvent) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target as Node) &&
    iconRef.value &&
    !iconRef.value.contains(event.target as Node)
  ) {
    // console.log('isMenuVisible handle:', isMenuVisible.value)
    isMenuVisible.value = false // 如果点击的是菜单外部，隐藏菜单
  }
}

// 在组件挂载时添加事件监听并初始化 authStore
onMounted(async () => {
  console.log('Initializing AuthStore from LocalStorage...')
  authStore.initialize() // 从 localStorage 初始化 authStore

  console.log('AuthStore Initialized:', {
    isAuthenticated: authStore.isAuthenticated,
    userInfo: authStore.userInfo,
  })

  document.addEventListener('click', handleClickOutside)

  try {
    currentPage.value = 1; // 初始化页码
    await loadHistory()
  } catch (error) {
    console.error('初始化加载历史记录失败:', error)
  } finally {
    isLoading.value = false
    loadingMessages.value = false // 确保输入框解锁
  }
})

// 在组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 注销逻辑
const onLogout = () => {
  authStore.logout() // 调用登出方法
  isMenuVisible.value = false
  alert('您已注销！')
  router.push('/login') // 跳转到登录页
}
</script>

<style scoped>
/* 页面整体布局 */
.chat-page {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #f4f4f4;
  overflow: hidden;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}

.spacer {
  flex: 1; /* 占据剩余空间 */
}

.new-chat-icon {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 24px;
  height: 24px;
  margin-left: 2px;
}

.new-chat-icon svg {
  fill: #333; /* 图标颜色 */
  transition:
    transform 0.3s,
    fill 0.3s;
}

.new-chat-icon:hover svg {
  fill: #007bff; /* 鼠标悬停时变色 */
}

/* 左侧历史记录 */
.sidebar {
  width: 20%;
  height: calc(100vh - 20px); /* 设置为视口高度减去一定边距 */
  background: #f8f9fa;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 50px; /* 折叠状态的宽度 */
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}

.icon {
  display: inline-block;
  font-size: 1.5rem;
  color: #333;
  transition: transform 0.3s ease; /* 添加平滑旋转动画 */
}

.icon.rotated {
  transform: rotate(90deg); /* 折叠时旋转90度 */
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar .chat-item {
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sidebar .chat-item:hover {
  background-color: #e8e8e8;
}

.load-more-btn {
  display: block;
  margin: 10px auto;
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.load-more-btn:hover {
  background-color: #0056b3;
}

/* 主对话区域 */
.chat-container {
  flex: 1; /* 填充剩余空间 */
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0 10px 10px 0;
}

.message-container {
  position: relative; /* 确保子元素可以使用绝对定位 */
  /* display: flex; */
  /* align-items: center; */
  /* justify-content: left; 左右分布 */
  margin-bottom: 10px;
}

/* 消息显示区域 */
.messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message {
  margin: 10px 0;
  margin-bottom: 28px;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 70%;
  font-size: 0.9rem;
  line-height: 1.4;
  position: relative; /* 为了兼容后续扩展 */
}

.message.editable {
  outline: 2px solid #007bff;
  background-color: #fff;
}

.edit-icon {
  position: absolute; /* 绝对定位 */
  top: 100%; /* 距离顶部 5px */
  left: 1%; /* 距离右侧 5px */
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 10px;
}

.edit-icon:hover {
  border-radius: 8px;
  background-color: #f0f0f0; /* 浅灰色背景 */
}

/* 铅笔图标的镜像效果 */
.mirrored {
  display: inline-block;
  transform: scaleX(-1); /* 水平翻转 */
}

/* 编辑模式下的保存和取消按钮样式 */
.edit-actions {
  position: absolute; /* 绝对定位到右侧 */
  top: 5%; /* 距顶部 5px */
  right: 20%; /* 距右侧 5px */
  display: flex;
  gap: 5px; /* 按钮之间的间距 */
}

.save-icon,
.cancel-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.save-icon:hover {
  color: green; /* 保存按钮悬停颜色 */
}

.cancel-icon:hover {
  color: red; /* 取消按钮悬停颜色 */
}

/* Markdown 样式 Start*/
.message h1 {
  font-size: 1.5rem;
  margin: 10px 0;
}

.message h2 {
  font-size: 1.3rem;
  margin: 8px 0;
}

.message p {
  margin: 5px 0;
}

.message code {
  background-color: #f4f4f4;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.message pre {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
}

/* Markdown 样式 End*/

.message.user {
  background-color: #e8f5e9;
  align-self: flex-end;
}

.message.ai {
  background-color: #f1f8ff;
  align-self: flex-start;
}

/* 输入框 */
/* 输入框区域 */
.input-container {
  padding: 20px 20px;
  background-color: #fff; /* 背景色 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 输入框卡片样式 */
.input-box {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 800px;
  padding: 20px 20px;
  background-color: #f4f4f4; /* 白色背景 */
  border-radius: 30px; /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 阴影 */
  gap: 10px;
}

/* 输入框 */
.input-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #333;
  background: none;
}

/* 发送按钮 */
.send-button {
  width: 40px;
  height: 40px;
  background-color: #000; /* 黑色背景 */
  border: none;
  border-radius: 50%; /* 圆形 */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover {
  background-color: #333; /* 悬停变更颜色 */
}

/* 发送按钮中的箭头 */
.send-button .arrow {
  color: #fff; /* 白色箭头 */
  padding-bottom: 3px; /* 调整箭头位置 */
  font-size: 1.8rem; /* 调整箭头大小 */
  font-weight: bold; /* 加粗箭头 */
  line-height: 1; /* 确保箭头垂直居中 */
  font-family: Arial, sans-serif; /* 确保箭头样式更一致 */
  transform: scale(1.2); /* 进一步放大 */
}

.loading-indicator {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin-top: 10px;
}

/* 登录图标样式 */
.login-icon {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 35px;
  height: 35px;
  background-color: #d85a16; /* 默认圆形背景色 */
  border-radius: 50%; /* 圆形效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: default; /* 默认状态不显示手型 */
  transition:
    background-color 0.3s,
    box-shadow 0.3s;
}

.login-icon svg {
  color: #fff; /* 默认图标颜色 */
  transition: color 0.3s;
}

.login-icon:hover {
  cursor: pointer; /* 鼠标悬浮显示手型 */
}

.username-display {
  max-width: 150px; /* 设置最大宽度，按需调整 */
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 隐藏溢出的内容 */
  text-overflow: ellipsis; /* 使用省略号表示溢出的内容 */
  font-size: 16px; /* 字体大小 */
  color: #333; /* 字体颜色 */
  display: inline-block; /* 确保 ellipsis 生效 */
  vertical-align: middle; /* 对齐方式 */
}

/* 弹出菜单 */
.menu {
  position: absolute;
  top: 60px; /* 对齐到图标底部 */
  right: 15px; /* 与图标右边对齐 */
  width: 150px; /* 菜单宽度适配 */
  background-color: #fff; /* 白色背景 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 增加阴影与图标一致 */
  border-radius: 10px; /* 圆角与图标保持一致 */
  overflow: hidden; /* 防止溢出 */
  z-index: 100; /* 确保菜单显示在顶部 */
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  padding: 10px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu li:hover {
  background-color: #f5f5f5;
}
</style>
