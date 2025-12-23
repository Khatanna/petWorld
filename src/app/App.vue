<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onAuthStateChanged, auth, db } from "./config/firebase";
import {
  query,
  get,
  ref,
  limitToFirst,
  orderByChild,
  equalTo,
} from "firebase/database";
import { useUserStore } from "@/core/store/useUserStore";

const router = useRouter();
const userStore = useUserStore();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    userStore.loading = true;
    if (!user.providerData[0]) {
      console.error("No se pudo obtener la información del usuario.");
      return;
    }
    const email = user.providerData[0]?.email;
    if (!email) {
      console.warn("Usuario no autenticado.");
      return;
    }
    const snapshot = await get(
      query(
        ref(db, "users"),
        limitToFirst(1),
        orderByChild("email"),
        equalTo(email),
      ),
    );

    if (snapshot.exists()) {
      const users = snapshot.val();
      const firstUser = Object.values(users)[0] as
        | {
            uid: string;
            email: string;
            name: string;
            photoUrl: string;
            tenantId: string;
          }
        | undefined;

      if (!firstUser) {
        console.warn("No se encontró ningún usuario en la ruta /users");
        return;
      }

      userStore.setUserData({
        uid: user.uid,
        email: user.providerData[0].email,
        name: user.providerData[0].displayName,
        photoUrl: user.providerData[0].photoURL,
        tenantId: firstUser.tenantId,
      });
    }
    userStore.loading = false;
    router.push("/visitas");
  } else {
    router.push("/login");
  }
});
</script>

<template>
  <router-view />
</template>
