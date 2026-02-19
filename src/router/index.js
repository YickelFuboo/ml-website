import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: { title: '魔灵' },
  },
  {
    path: '/qa',
    name: 'KnowledgeQA',
    component: () => import('../views/KnowledgeQAPage.vue'),
    meta: { title: '知识问答 - 魔灵' },
  },
  {
    path: '/settings',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
