<script setup lang="ts">
import { auth } from "@/app/config/firebase";
import ErrorWrapper from "@/components/ErrorWrapper.vue";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../store/useUserStore";

const drawerOpen = ref(true);
const tenantName = import.meta.env.VITE_TENANT_NAME || "PetWorld";

const route = useRoute();

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}

const userStore = useUserStore();
const logout = () => auth.signOut();
</script>

<template>
  <error-wrapper ref="errorWrapper">
    <q-layout view="lHh Lpr lFf">
      <q-header elevated>
        <q-toolbar>
          <q-btn flat round icon="menu" @click="toggleDrawer" />
          <q-toolbar-title>{{ route.name }}</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer v-model="drawerOpen" side="left" elevated>
        <div class="column full-height">
          <div class="bg-primary q-py-md q-px-sm flex items-center q-mb-sm">
            <div class="bg-primary q-pa-xs rounded-borders q-mr-sm shadow-2">
              <q-icon name="pets" color="white" size="36px"></q-icon>
            </div>
            <div
              class="text-h6 text-weight-bold text-white"
              style="letter-spacing: -0.3px"
            >
              {{ tenantName }}
            </div>
          </div>
          <q-list>
            <q-item clickable v-ripple to="/visitas">
              <q-item-section avatar>
                <q-icon name="event" />
              </q-item-section>
              <q-item-section>Visitas</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/usuarios">
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>
              <q-item-section>Usuarios</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/gastos">
              <q-item-section avatar>
                <q-icon name="attach_money" />
              </q-item-section>
              <q-item-section>Gastos</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/reportes">
              <q-item-section avatar>
                <q-icon name="bar_chart" />
              </q-item-section>
              <q-item-section>Reportes</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/estadisticas">
              <q-item-section avatar>
                <q-icon name="analytics" />
              </q-item-section>
              <q-item-section>Estadisticas</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Cerrar sesión</q-item-section>
            </q-item>
          </q-list>

          <q-space></q-space>

          <div class="q-pa-md border-t q-mt-auto" v-if="userStore.userData">
            <q-item class="bg-orange-1 rounded-borders cursor-pointer q-pa-sm">
              <q-item-section avatar>
                <q-avatar
                  color="orange-2"
                  text-color="orange-9 "
                  font-size="14px"
                  class="text-weight-bold"
                  v-if="userStore.userData?.photoUrl"
                >
                  <img
                    :src="userStore.userData.photoUrl"
                    :alt="userStore.userData.name"
                  />
                  /></q-avatar
                >
              </q-item-section>
              <q-item-section>
                <q-item-label
                  class="text-weight-bold text-grey-9 text-uppercase"
                  >{{ userStore.userData.name }}</q-item-label
                >
                <q-item-label caption>{{
                  userStore.userData.email
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-drawer>

      <q-page-container style="height: 100vh">
        <router-view />
      </q-page-container>
    </q-layout>
  </error-wrapper>
</template>
