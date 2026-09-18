import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/dashboard/trips/:tripId',
      name: 'trip-detail',
      component: () => import('@/views/TripDetail.vue')
    },
    {
      path: '/trips/:shareCode',
      name: 'traveler-view',
      component: () => import('@/views/TravelerView.vue')
    }
  ]
})

export default router
