import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PostsView from './views/PostsView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import SubmitView from './views/SubmitView.vue'
import MapView from './views/MapView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },    
    { path: '/posts', component: PostsView },
    { path: '/map', component: MapView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/submit', component: SubmitView },
  ],
})
