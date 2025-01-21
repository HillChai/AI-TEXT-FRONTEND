<template>
  <div class="login-container">
    <div class="logo">
      <!-- 替换为实际的 logo 图片路径 -->
      <!-- <img src="/logo.png" alt="Logo" /> -->
    </div>
    <h1 class="welcome-text">{{ pageTitle }}</h1>
    <p class="subtitle-text">设置密码以继续使用</p>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <input v-model="email" type="email" class="email-input" :readonly="true" required />
      </div>
      <div class="form-group">
        <input
          v-model="password"
          type="password"
          placeholder="密码*"
          class="password-input"
          required
        />
      </div>
      <button type="submit" class="continue-button">继续</button>
    </form>
    <button @click="goBack" class="back-button">返回</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { register, login } from '@/service/authService' // 引入封装的服务
import { useAuthStore } from '@/stores/authStore' // 引入 Pinia store

export default defineComponent({
  name: 'PasswordPage',
  setup() {
    const router = useRouter() // 获取 router
    const route = useRoute() // 获取 route
    const authStore = useAuthStore() // 引入用户状态管理
    const email = ref(route.query.email || '') // 响应式邮箱
    const password = ref('') // 响应式密码

    // 根据来源设置页面标题
    const pageTitle = route.query.from === 'signup' ? '创建用户' : '欢迎回来'

    // 提交表单
    const handleSubmit = async () => {
      if (!password.value.trim()) {
        alert('请输入密码！')
        return
      }

      try {
        if (route.query.from === 'signup') {
          // 调用注册服务
          await register(email.value, password.value)
          // alert('注册成功，请登录！')
          password.value = '' // 清空密码字段
          router.push('/login') // 跳转到登录页
        } else {
          // 调用登录服务
          const result = await login(email.value, password.value)

          console.log("result:",result)

          // 将 token 和部分用户信息存储到 localStorage，以便跨会话持久化
          // 使用 authStore 的 login 方法处理状态更新
          authStore.login(result.access_token, {
            username: result.user.username,
            user_id: result.user.user_id,
            model_quota: result.user.model_quota.toString(),
            membership_type: result.user.membership_type,
          })
          // alert('登录成功！')
          router.push('/chat') // 跳转到主页面
        }
      } catch (error: any) {
        console.error('操作失败:', error)
        alert(error.response?.data?.detail || '操作失败，请稍后重试！')
      }
    }

    // 返回上一页
    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1) // 返回上一页
      } else {
        router.push('/login') // 如果没有历史记录，跳转到登录页
      }
    }

    return {
      email,
      password,
      pageTitle,
      handleSubmit,
      goBack,
    }
  },
})
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  text-align: center;
  font-family: Arial, sans-serif;
}

.logo img {
  width: 50px;
  margin-bottom: 20px;
}

.welcome-text {
  font-size: 30px;
  margin-bottom: 10px;
  font-weight: bold;
}

.subtitle-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.form-group {
  width: 300px;
  margin-bottom: 20px;
}

.email-input,
.password-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.password-input {
  background-color: white;
}

.continue-button {
  width: 100%;
  padding: 12px;
  background-color: #2dbf73;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.continue-button:hover {
  background-color: #26a565;
}

.back-button {
  margin-top: 10px;
  font-size: 14px;
  background: none;
  border: none;
  color: #2dbf73;
  cursor: pointer;
}

.back-button:hover {
  text-decoration: underline;
}
</style>
