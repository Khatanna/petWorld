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
        component: () => import("@modules/visit/views/VisitList.vue"),
      },
      {
        path: "usuarios",
        name: "Usuarios",
        component: () => import("@modules/visit/views/VisitList.vue"),
        //component: () => import("@modules/user/views/UserList.vue"),
      },
      {
        path: "gastos",
        name: "Gastos",
        component: () => import("@modules/visit/views/VisitList.vue"),
        //component: () => import("@modules/expense/views/ExpenseList.vue"),
      },
      {
        path: "reportes",
        name: "Reportes",
        component: () => import("@modules/visit/views/VisitList.vue"),
        //component: () => import("@modules/report/views/ReportList.vue"),
      },
      {
        path: "estadisticas",
        name: "Estadisticas",
        component: () => import("@modules/visit/views/VisitList.vue"),
        //component: () => import("@modules/statistics/views/StatisticsList.vue"),
      },
      {
        path: "cerrar-sesion",
        name: "CerrarSesion",
        component: () => import("@modules/visit/views/VisitList.vue"),
        //component: () => import("@modules/auth/views/Logout.vue"),
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
