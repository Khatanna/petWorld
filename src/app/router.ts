import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { auth } from "@/app/config/firebase";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/core/layouts/MainLayout.vue"),
    beforeEnter: (_to, _from, next) => {
      if (auth.currentUser) {
        next();
      } else {
        next({ name: "Login" });
      }
    },
    children: [
      {
        path: "visitas",
        name: "Visitas",
        component: () => import("@modules/visit/ui/layouts/VisitLayout.vue"),
      },
      {
        path: "usuarios",
        name: "Usuarios",
        component: () => import("@modules/user/ui/layouts/UserLayout.vue"),
      },
      {
        path: "gastos",
        name: "Gastos",
        component: () => import("@modules/bill/ui/layouts/BillLayout.vue"),
      },
      {
        path: "reportes",
        name: "Reportes",
        component: () => import("@modules/report/ui/layouts/ReportLayout.vue"),
      },
      {
        path: "estadisticas",
        name: "Estadisticas",
        component: () => import("@modules/stats/ui/layouts/StatsLayout.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@modules/auth/views/Login.vue"),
    beforeEnter: (_to, _from, next) => {
      if (auth.currentUser) {
        next({ name: "Visitas" });
      } else {
        next();
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
