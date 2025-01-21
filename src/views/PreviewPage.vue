<template>
  <div class="chat-page">
    <!-- 主对话区域 -->
    <div class="chat-container">
      <!-- 消息显示区域 -->
      <div class="messages" ref="messageContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
          v-html="message.content"
        ></div>

        <!-- 加载动画 -->
        <div v-if="isLoading" class="loading-indicator">正在思考...</div>
      </div>

      <!-- 输入框 -->
      <div class="input-container">
        <div class="input-box">
          <input v-model="userInput" :disabled="isLoading" placeholder="告诉我，你的题目" />
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
    <div class="auth-buttons">
      <!-- 登录按钮 -->
      <button class="auth-button login">登录</button>
      <!-- 注册按钮 -->
      <button class="auth-button register">注册</button>
    </div>
  </div>

  <!-- 遮罩层 -->
  <div v-if="showCard" class="overlay">
    <!-- 中间弹出卡片 -->
    <div class="login-card" :class="{ visible: showCard }">
      <h2 class="login-card-title">欢迎回来</h2>
      <p class="login-card-description">登录或注册以体验面试辅导。</p>
      <p>
        <button class="auth-button-card login" @click="$router.push('/login')">登录</button>
      </p>
      <p>
        <button class="auth-button-card register" @click="$router.push('/signup')">注册</button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showCard = ref(true) // 卡片动画显示状态

// 初始化对话内容
const messages = ref<{ role: string; content: string }[]>([
  { role: 'ai', content: '欢迎体验面试题辅导！' },
])

// 页面加载时显示卡片动画
// onMounted(() => {
//   setTimeout(() => {
//     showCard.value = true
//   }, 300) // 延迟 300ms 触发淡入动画
// })
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

/* 主对话区域 */
.chat-container {
  flex: 1; /* 填充剩余空间 */
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0 10px 10px 0;
}

/* 消息显示区域 */
.messages {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

.message {
  margin: 10px 20px;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 20%;
  min-width: 145px;
  font-size: 1.2rem;
  line-height: 1.4;
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
  cursor: No;
  transition: background-color 0.3s;
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

/* 容器布局 */
.auth-buttons {
  display: flex;
  gap: 10px;
  position: absolute;
  top: 15px;
  right: 15px;
}

/* 按钮通用样式 */
.auth-button {
  padding: 5px 20px;
  font-size: 14px;
  border-radius: 20px;
  cursor: No;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

/* 登录按钮样式 */
.auth-button.login {
  background-color: #000;
  color: #fff;
  border-color: #000;
}

/* 注册按钮样式 */
.auth-button.register {
  background-color: #fff;
  color: #000;
  border-color: #ddd;
}

/* 主对话区域模糊效果 */
.chat-container.blurred {
  filter: blur(5px); /* 模糊效果 */
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2); /* 黑色透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 中间弹出卡片 */
.login-card {
  position: absolute;
  max-width: 400px;
  height: 300px;
  width: 90%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 20px 30px;
  opacity: 1;
  transform: scale(0.9);
  transition: all 0.3s ease;
}

.login-card.visible {
  opacity: 1;
  transform: scale(1);
}

.login-card-title {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-card-description {
  font-size: 27px;
  color: #666;
  margin-bottom: 20px;
}

/* 容器布局 */
.auth-buttons-card {
  display: flex;
  gap: 10px;
  position: absolute;
  top: 15px;
  right: 15px;
}

/* 按钮通用样式 */
.auth-button-card {
  padding: 10px 130px;
  font-size: 14px;
  border-radius: 20px;
  margin-bottom: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

/* 登录按钮样式 */
.auth-button-card.login {
  background-color: #000;
  color: #fff;
  border-color: #000;
}

/* 注册按钮样式 */
.auth-button-card.register {
  background-color: #fff;
  color: #000;
  border-color: #ddd;
}
</style>
