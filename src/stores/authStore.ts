import { defineStore } from 'pinia'

interface UserInfo {
  username: string
  user_id: string
  model_quota: string
}

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    isAuthenticated: false,
    userInfo: null as UserInfo | null, // 类型为 UserInfo 或 null
  }),
  actions: {
    initialize() {
      const token = localStorage.getItem('access_token')
      const username = localStorage.getItem('username')
      const userId = localStorage.getItem('user_id')
      const model_quota = localStorage.getItem('model_quota')

      if (token && username && userId && model_quota) {
        this.isAuthenticated = true
        this.userInfo = { username, user_id: userId, model_quota: model_quota }
      }
    },
    login(token: string, userInfo: { username: string; user_id: string }) {
      this.isAuthenticated = true
      this.userInfo = userInfo

      // 持久化到 localStorage
      localStorage.setItem('access_token', token)
      localStorage.setItem('username', userInfo.username)
      localStorage.setItem('user_id', userInfo.user_id)
      localStorage.setItem('model_quota', userInfo.model_quota)
    },
    updateUserInfo(updates) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...updates }
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo)) // 同步到 localStorage
      }
    },
    logout() {
      this.isAuthenticated = false
      this.userInfo = null

      // 清除 localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('username')
      localStorage.removeItem('user_id')
      localStorage.removeItem('model_quota')
    },
  },
})
