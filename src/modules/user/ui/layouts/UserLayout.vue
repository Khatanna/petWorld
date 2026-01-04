<script lang="ts" setup>
import { useUserStore } from "@/core/store/useUserStore";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { useQuasar } from "quasar";
import { computed } from "vue";
import { UserRepository } from "../../infrastructure/user.repository";

const $q = useQuasar();
const userStore = useUserStore();
const { getUsers, toggleAllowed, toggleOwner, asignTenantId } = UserRepository(
  userStore.userData!.tenantId!,
);

const {
  data: users,
  isLoading,
  error,
  isFetching,
  refetch,
} = useQuery({
  queryKey: ["userList"],
  queryFn: async () => {
    return await getUsers();
  },
  initialData: [],
  refetchOnWindowFocus: false,
});

const showError = computed(() => error.value);
const showLoading = computed(() => isLoading.value || isFetching.value);

const { mutate: toggleOwnerMutation } = useMutation({
  mutationFn: (uid: string) => toggleOwner(uid),
  onMutate() {
    $q.notify({
      type: "info",
      message: "Actualizando rol de propietario...",
      timeout: 1000,
    });
  },
  onSuccess() {
    $q.notify({
      type: "positive",
      message: "Rol de propietario actualizado.",
      timeout: 2000,
    });

    refetch();
  },
  onError(error) {
    $q.notify({
      type: "negative",
      message: `Error al actualizar el rol: ${error.message}`,
      timeout: 3000,
    });
  },
});

const { mutate: toggleAllowedMutation } = useMutation({
  mutationFn: (uid: string) => toggleAllowed(uid),
  onMutate() {
    $q.notify({
      type: "info",
      message: "Actualizando acceso del usuario...",
      timeout: 1000,
    });
  },
  onSuccess() {
    $q.notify({
      type: "positive",
      message: "Acceso del usuario actualizado.",
      timeout: 2000,
    });

    refetch();
  },
  onError(error) {
    $q.notify({
      type: "negative",
      message: `Error al actualizar el acceso: ${error.message}`,
      timeout: 3000,
    });
  },
});

const { mutate: asignTenantIdMutation } = useMutation({
  mutationFn: (uid: string) => asignTenantId(uid),
  onMutate() {
    $q.notify({
      type: "info",
      message: "Asignando tenant al usuario...",
      timeout: 1000,
    });
  },
  onSuccess() {
    $q.notify({
      type: "positive",
      message: "Tenant asignado al usuario.",
      timeout: 2000,
    });

    refetch();
  },
  onError(error) {
    $q.notify({
      type: "negative",
      message: `Error al asignar el tenant: ${error.message}`,
      timeout: 3000,
    });
  },
});

const handleToggleOwner = (uid: string) => {
  toggleOwnerMutation(uid);
};

const handleToggleAllowed = (uid: string) => {
  toggleAllowedMutation(uid);
};

const handleAsignTenantId = (uid: string) => {
  asignTenantIdMutation(uid);
};
</script>

<template>
  <q-page class="full-height" padding>
    <div
      v-if="showLoading"
      class="text-center q-py-xl full-height flex column items-center justify-center"
    >
      <q-spinner color="primary" size="4rem" class="q-mb-md"></q-spinner>
      <div>Cargando usuarios...</div>
    </div>
    <div
      v-else-if="showError"
      class="text-center q-py-xl text-red-5 full-height flex column items-center justify-center"
    >
      <q-icon name="error" size="4rem" class="q-mb-md"></q-icon>
      <div>Error al cargar la lista de usuarios.</div>
    </div>
    <div v-else>
      <q-virtual-scroll :items="users" item-size="72" class="full-width">
        <template v-slot="{ item }">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img :src="item.photoUrl" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.name }}</q-item-label>
              <q-item-label caption>{{ item.email }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round icon="more_vert">
                <q-menu anchor="bottom right" self="top right">
                  <q-list>
                    <q-item
                      clickable
                      v-ripple
                      v-close-popup
                      @click="handleToggleOwner(item.id)"
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="item.owner ? 'person_remove' : 'person_add'"
                          :color="item.owner ? 'primary' : 'grey-7'"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>
                          {{
                            item.owner
                              ? "Volver usuario"
                              : "Volver administrador"
                          }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable @click="handleToggleAllowed(item.id)">
                      <q-item-section avatar>
                        <q-icon
                          :name="item.isAllowed ? 'lock_open' : 'lock'"
                          color="primary"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>
                          {{ item.allowed ? "Bloquear" : "Desbloquear" }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <template v-if="!item.allowed && item.tenantId === ''">
                      <q-separator />
                      <q-item clickable @click="handleAsignTenantId(item.id)">
                        <q-item-section avatar>
                          <q-icon name="domain" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label> Asignar al este tenant </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </div>
  </q-page>
</template>
