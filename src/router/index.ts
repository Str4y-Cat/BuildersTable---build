import { createRouter, createWebHistory } from 'vue-router'
import Landing from '@/views/Landing.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')
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
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  }
})

export default router
