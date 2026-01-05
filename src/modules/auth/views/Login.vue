<script lang="ts" setup>
import google from "@/core/assets/google.png";
import logo from "@/core/assets/logo.png";
import { useUserStore } from "@/core/store/useUserStore";
import { auth, provider, signInWithPopup } from "../../../app/config/firebase";
import {
  createUser,
  getUserByEmail,
} from "@/modules/user/infrastructure/user.repository";
import { useQuasar } from "quasar";

const userStore = useUserStore();
const $q = useQuasar();
const loginGoogle = async () => {
  try {
    provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
    provider.addScope("https://www.googleapis.com/auth/userinfo.email");

    const userCredential = await signInWithPopup(auth, provider);

    const email = userCredential.user.providerData[0]?.email;

    if (email) {
      const user = await getUserByEmail(email);

      if (user) {
        if (!user?.allowed) {
          $q.notify({
            type: "info",
            message:
              "Usuario no autorizado. Por favor, contacte al administrador.",
          });

          return;
        }
        userStore.setUserData(user);
      } else {
        createUser(userCredential.user.uid, {
          allowed: false,
          owner: false,
          email: userCredential.user.providerData[0]?.email || "",
          name: userCredential.user.providerData[0]?.displayName || "",
          photoUrl: userCredential.user.providerData[0]?.photoURL || "",
          tenantId: "",
        });

        $q.notify({
          type: "info",
          message:
            "Usuario creado. Por favor, contacte al administrador para obtener acceso.",
        });
      }
    }
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
