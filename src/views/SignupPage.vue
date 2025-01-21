<template>
  <div class="login-container">
    <div class="logo">
      <!-- 替换为实际的 logo 图片路径 -->
      <!-- <img src="/logo.png" alt="Logo" /> -->
    </div>
    <h1 class="welcome-text">创建用户</h1>
    <form @submit.prevent="handleSignup">
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
    <div class="register-link">
      已经拥有账户？
      <a @click.prevent="$router.push('/login')" class="register-text">登录</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'SignupPage',
  setup() {
    const email = ref('') // 响应式数据
    const router = useRouter() // 路由实例

    const handleSignup = () => {
      if (email.value.trim()) {
        // 跳转到 PasswordPage 并传递参数
        router.push({
          path: '/password',
          query: {
            from: 'signup',
            email: email.value,
          },
        })
      } else {
        alert('请输入有效的电子邮件地址！')
      }
    }

    return {
      email,
      handleSignup,
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

.register-link {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-text {
  color: #2dbf73;
  text-decoration: none;
  cursor: pointer;
}

.register-text:hover {
  text-decoration: underline;
}
</style>
