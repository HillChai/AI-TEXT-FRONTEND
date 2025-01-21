import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import ChatPage from '@/views/ChatPage.vue'
import PreviewPage from '@/views/PreviewPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import SignupPage from '@/views/SignupPage.vue'
import PasswordPage from '@/views/PasswordPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
  },
  {
    path: '/preview',
    name: 'Preview',
    component: PreviewPage,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/password',
    name: 'Password',
    component: PasswordPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
