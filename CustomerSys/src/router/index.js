import { createRouter, createWebHistory } from 'vue-router'
import loginView from '../views/Login.vue'
import HomeView from '../views/HomeView.vue'
import managementView from '../views/management.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: loginView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/home',
      name: 'homeview',
      component: HomeView
    },
    {
      path: '/management',
      name: 'management',
      component: managementView
    },
  ]
})

export default router
