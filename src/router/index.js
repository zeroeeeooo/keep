import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Keep from '../views/Keep.vue'
import Profile from '../views/Profile.vue'
import Friends from '../views/Friends.vue'
import Notes from '../views/Notes.vue'
import { auth } from '../store/auth.js'

const routes = [
  {
    path: '/',
    redirect: () => {
      // 已登录去首页，未登录去 KEEPro（游客模式）
      return auth.loggedIn ? '/home' : '/keepimage'
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
    meta: { guest: true } // 游客可访问
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.loggedIn) {
    // 需要登录但未登录 → 跳转到 KEEPro（游客模式入口）
    next({ name: 'Keep' })
  } else if (to.meta.guest && auth.loggedIn && to.name !== 'Keep') {
    // 已登录用户访问登录/注册页 → 跳转首页
    // 游客页中保持 Keep 访问不受限
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
