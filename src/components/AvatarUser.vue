<script lang="ts" setup>
import { useUserStore } from "@/core/store/useUserStore";
import { UserRepository } from "@/modules/user/infrastructure/user.repository";
import { useQuery } from "@tanstack/vue-query";
import logo from "@/core/assets/logo.png";
const props = defineProps<{
  userId: string;
}>();

const userStore = useUserStore();
const { getAvatarUrl } = UserRepository(userStore.userData!.tenantId!);
const { data, isLoading, isFetching, error } = useQuery({
  queryKey: ["avatarUrl", props.userId],
  queryFn: async () => {
    return await getAvatarUrl(props.userId);
  },
  initialData: "",
  refetchOnWindowFocus: false,
});
</script>

<template>
  <div v-if="isLoading || isFetching">
    <q-spinner />
  </div>
  <q-avatar v-else-if="error" color="primary" text-color="white">
    <img :src="logo" alt="logo" />
  </q-avatar>
  <q-avatar v-else>
    <img :src="data" :alt="userId" />
  </q-avatar>
</template>
