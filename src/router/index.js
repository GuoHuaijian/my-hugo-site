import { createRouter, createWebHistory } from 'vue-router'
import siteConfig from '../../content/site-config.json'
import { applyMeta } from '../composables/useMeta'

const { router: routerConfig, site, pages } = siteConfig

const PAGE_DESCRIPTIONS = {
  home: site.description || '贩卖代码、笔记与偶尔的胡思乱想。',
  notes: pages?.notes?.description || '技术笔记与思考碎片。',
  projects: pages?.projects?.description || '有趣的开源项目与实验。',
  books: pages?.books?.description || '书架上的折角、摘录与读后感。',
  toolbox: pages?.toolbox?.description || '收藏的工具、资源与奇妙链接。',
  about: '关于云边小卖部和它的店主。',
}

const routes = [
  {
    path: '/', name: 'home', component: () => import('../views/Home.vue'),
    meta: { title: routerConfig.pageTitles.home, description: PAGE_DESCRIPTIONS.home, ogType: 'website' },
  },
  {
    path: '/notes', name: 'notes', component: () => import('../views/Notes.vue'),
    meta: { title: routerConfig.pageTitles.notes, description: PAGE_DESCRIPTIONS.notes, ogType: 'website' },
  },
  {
    path: '/notes/archive', name: 'archive', component: () => import('../views/Archive.vue'),
    meta: { title: routerConfig.pageTitles.archive, description: '按时间归档浏览所有笔记。', ogType: 'website' },
  },
  {
    path: '/notes/:slug', name: 'note-detail', component: () => import('../views/NoteDetail.vue'),
    meta: { title: routerConfig.pageTitles['note-detail'], description: '', ogType: 'article' },
  },
  {
    path: '/projects', name: 'projects', component: () => import('../views/Projects.vue'),
    meta: { title: routerConfig.pageTitles.projects, description: PAGE_DESCRIPTIONS.projects, ogType: 'website' },
  },
  {
    path: '/projects/:slug/:page(.*)?', name: 'project-doc', component: () => import('../views/DocReader.vue'),
    meta: { type: 'projects', title: routerConfig.pageTitles['project-doc'], description: '', ogType: 'article' },
  },
  {
    path: '/books', name: 'books', component: () => import('../views/Books.vue'),
    meta: { title: routerConfig.pageTitles.books, description: PAGE_DESCRIPTIONS.books, ogType: 'website' },
  },
  {
    path: '/books/:slug/pdf/:page', name: 'book-pdf', component: () => import('../views/PdfReader.vue'),
    meta: { title: routerConfig.pageTitles['book-pdf'], description: '', ogType: 'article' },
  },
  {
    path: '/books/:slug/:page(.*)?', name: 'book-doc', component: () => import('../views/DocReader.vue'),
    meta: { type: 'books', title: routerConfig.pageTitles['book-doc'], description: '', ogType: 'article' },
  },
  {
    path: '/toolbox', name: 'toolbox', component: () => import('../views/Toolbox.vue'),
    meta: { title: routerConfig.pageTitles.toolbox, description: PAGE_DESCRIPTIONS.toolbox, ogType: 'website' },
  },
  {
    path: '/toolbox/:doc', name: 'toolbox-doc', component: () => import('../views/ToolboxDoc.vue'),
    meta: { title: routerConfig.pageTitles['toolbox-doc'], description: '', ogType: 'article' },
  },
  {
    path: '/about', name: 'about', component: () => import('../views/About.vue'),
    meta: { title: routerConfig.pageTitles.about, description: PAGE_DESCRIPTIONS.about, ogType: 'website' },
  },
  {
    path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到', description: '你找的页面不存在。', ogType: 'website' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.afterEach((to) => {
  const pageTitle = to.meta.title
  const title = pageTitle ? `${pageTitle}${routerConfig.titleSuffix}` : site.name

  applyMeta({
    title,
    description: to.meta.description || site.description || '贩卖代码、笔记与偶尔的胡思乱想。',
    url: `${site.url}${to.fullPath}`,
    type: to.meta.ogType || 'website',
  })
})

export default router
