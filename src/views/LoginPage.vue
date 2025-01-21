<template>
  <div class="login-container">
    <div class="logo">
      <!-- 替换为实际的 logo 图片路径 -->
      <!-- <img src="/logo.png" alt="Logo" /> -->
    </div>
    <h1 class="welcome-text">欢迎回来</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <input
          v-model="email"
          type="email"
          placeholder="电子邮件地址*"
          class="email-input"
          required
        />
      </div>
      <button type="submit" class="continue-button">继续</button>
    </form>
    <div class="signup-link">
      还没有账户？
      <a @click.prevent="$router.push('/signup')" class="signup-text">注册</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const email = ref('') // 响应式数据
    const router = useRouter() // 获取 router 实例

    const handleLogin = () => {
      if (email.value.trim()) {
        router.push({
          path: '/password',
          query: {
            from: 'login',
            email: email.value,
          },
        })
      } else {
        alert('请输入有效的电子邮件地址！')
      }
    }

    return {
      email,
      handleLogin,
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
  margin-bottom: 20px;
  font-weight: bold;
}

.form-group {
  width: 300px;
  margin: 0 auto 20px;
}

.email-input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
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

.signup-link {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.signup-text {
  color: #2dbf73;
  text-decoration: none;
  cursor: pointer;
}

.signup-text:hover {
  text-decoration: underline;
}
</style>
