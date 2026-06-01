import { createRouter, createWebHistory } from "vue-router"
import LoginLayout from "@/layout/LoginLayout.vue"

const routes = [
  {
    path: "/login",
    component: LoginLayout,
    meta: { hidden: true },
    children: [
      {
        path: "",
        name: "Login",
        component: () => import("@/views/login/Index.vue"),
      },
    ],
  },
  {
    path: "/register",
    component: LoginLayout,
    meta: { hidden: true },
    children: [
      {
        path: "",
        component: () => import("@/views/login/Index.vue"),
      },
    ],
  },
  {
    path: "/login/success",
    name: "LoginSuccess",
    component: () => import("@/views/login/LoginSuccess.vue"),
    meta: { hidden: true },
  },
  {
    path: "/",
    redirect: "/login",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export const constantRoutes = routes
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes,
  })
  router.matcher = newRouter.matcher
}

export default router
