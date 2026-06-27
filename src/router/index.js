import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

// 首页、登录、注册、Keep 首屏加载（用户最可能先访问的页面）
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

// 其他页面懒加载（用户可能访问频率较低）
const Keep = () => import('../views/Keep.vue')
const Profile = () => import('../views/Profile.vue')
const Friends = () => import('../views/Friends.vue')
const Notes = () => import('../views/Notes.vue')
const CorkBoard = () => import('../views/CorkBoard.vue')
const BoardDetail = () => import('../views/BoardDetail.vue')

const routes = [
  {
    path: '/',
    redirect: () => {
      const hasToken = !!localStorage.getItem('keep_auth_token')
      return hasToken ? '/home' : '/keepimage'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/keepimage',
    name: 'Keep',
    component: Keep,
    meta: { guest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/friends',
    name: 'Friends',
    component: Friends,
    meta: { requiresAuth: true }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes,
    meta: { requiresAuth: true }
  },
  {
    path: '/board',
    name: 'CorkBoard',
    component: CorkBoard,
    meta: { requiresAuth: true }
  },
  {
    path: '/board/:id',
    name: 'BoardDetail',
    component: BoardDetail,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.loggedIn) {
    next({ name: 'Keep' })
  } else if (to.meta.guest && auth.loggedIn && to.name !== 'Keep') {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
