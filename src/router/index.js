import { createRouter, createWebHistory } from 'vue-router'
import siteConfig from '../../content/site-config.json'

const { router: routerConfig, site } = siteConfig

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue'), meta: { title: routerConfig.pageTitles.home } },
  { path: '/notes', name: 'notes', component: () => import('../views/Notes.vue'), meta: { title: routerConfig.pageTitles.notes } },
  { path: '/notes/:slug', name: 'note-detail', component: () => import('../views/NoteDetail.vue'), meta: { title: routerConfig.pageTitles['note-detail'] } },
  { path: '/projects', name: 'projects', component: () => import('../views/Projects.vue'), meta: { title: routerConfig.pageTitles.projects } },
  { path: '/projects/:slug/:page(.*)?', name: 'project-doc', component: () => import('../views/DocReader.vue'), meta: { type: 'projects', title: routerConfig.pageTitles['project-doc'] } },
  { path: '/books', name: 'books', component: () => import('../views/Books.vue'), meta: { title: routerConfig.pageTitles.books } },
  { path: '/books/:slug/pdf/:page', name: 'book-pdf', component: () => import('../views/PdfReader.vue'), meta: { title: routerConfig.pageTitles['book-pdf'] } },
  { path: '/books/:slug/:page?', name: 'book-doc', component: () => import('../views/DocReader.vue'), meta: { type: 'books', title: routerConfig.pageTitles['book-doc'] } },
  { path: '/toolbox', name: 'toolbox', component: () => import('../views/Toolbox.vue'), meta: { title: routerConfig.pageTitles.toolbox } },
  { path: '/toolbox/:doc', name: 'toolbox-doc', component: () => import('../views/ToolboxDoc.vue'), meta: { title: routerConfig.pageTitles['toolbox-doc'] } },
  { path: '/about', name: 'about', component: () => import('../views/About.vue'), meta: { title: routerConfig.pageTitles.about } }
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
  document.title = pageTitle ? `${pageTitle}${routerConfig.titleSuffix}` : site.name
})

export default router
