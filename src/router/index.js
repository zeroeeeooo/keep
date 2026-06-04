import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Keep from '../views/Keep.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/keepimage',
    name: 'Keep',
    component: Keep
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router