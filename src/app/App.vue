<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onAuthStateChanged, auth } from "./config/firebase";

const router = useRouter();

onAuthStateChanged(auth, (user) => {
  if (user) {
    router.push("/visitas");
  } else {
    router.push("/login");
  }
});
</script>

<template>
  <router-view />
</template>
