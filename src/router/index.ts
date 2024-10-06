// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import SearchResult from '../views/SearchResult.vue'
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/search-result',
    name: 'SearchResult',
    component: SearchResult,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
