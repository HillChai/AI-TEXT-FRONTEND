import { defineStore } from 'pinia'

interface UserInfo {
  username: string
  user_id: string
  prompt_ids: number[]
  model_quota: string
  membership_type: string
}

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    isAuthenticated: false,
    userInfo: null as UserInfo | null, // 类型为 UserInfo 或 null
  }),
  actions: {
    initialize() {
      const token = localStorage.getItem('access_token')
      const userInfoString = localStorage.getItem('userInfo')

      if (token && userInfoString) {
        try {
          const parsedUserInfo: UserInfo = JSON.parse(userInfoString)
          
          // 确保 prompt_ids 存在并为数组
          if (!parsedUserInfo.prompt_ids) {
            parsedUserInfo.prompt_ids = []
          } 
          
          this.isAuthenticated = true
          this.userInfo = parsedUserInfo
        } catch (error) {
          console.error("Failed to parse userInfo from localStorage:", error)
        }
      }
    },
    login(token: string, userInfo: UserInfo) {
      this.isAuthenticated = true
      this.userInfo = userInfo

      // 持久化到 localStorage
      localStorage.setItem('access_token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    updateUserInfo(updates: Partial<UserInfo>) {
      if (this.userInfo) {
        // 更新 state
        this.userInfo = { ...this.userInfo, ...updates }

        // 同步更新到 localStorage
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      }
    },
    logout() {
      this.isAuthenticated = false
      this.userInfo = null

      // 清除 localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('userInfo')
    },
  },
})
