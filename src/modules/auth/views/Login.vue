<script lang="ts" setup>
import google from "@/core/assets/google.png";
import logo from "@/core/assets/logo.png";
import { useUserStore } from "@/core/store/useUserStore";
import { auth, provider, signInWithPopup } from "../../../app/config/firebase";

const userStore = useUserStore();
const loginGoogle = async () => {
  try {
    provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
    provider.addScope("https://www.googleapis.com/auth/userinfo.email");

    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error en login:", error);
  }
};
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container style="height: 100vh" id="page-container-login">
      <q-page class="flex flex-center column">
        <img :src="logo" alt="logo" width="250" class="q-mb-xl" id="logo" />
        <q-btn @click="loginGoogle" color="white" :loading="userStore.loading">
          <q-avatar size="24px">
            <img :src="google" />
          </q-avatar>
          <div class="q-ml-sm text-black">Iniciar sesión con Google</div>
        </q-btn>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
#page-container-login {
  background-image: url("../../../core/assets/background.png");
  background-size: cover;
}

#logo {
  border-radius: 100%;
  clip-path: circle(115px at center);
}
</style>
