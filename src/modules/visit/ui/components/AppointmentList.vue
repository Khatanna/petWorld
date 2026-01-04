<script lang="ts" setup>
import { useQuasar } from "quasar";
import type { Visit } from "../../domain/visit.model";
import { computed } from "vue";
const { appointments, showLoading } = defineProps<{
  appointments: Array<Visit>;
  showLoading: boolean;
}>();

const $q = useQuasar();
const getRandomColor = (seed: string) => {
  const colors = [
    "red",
    "pink",
    "purple",
    "deep-purple",
    "indigo",
    "blue",
    "light-blue",
    "cyan",
    "teal",
    "green",
    "light-green",
    "lime",
    "amber",
    "orange",
    "deep-orange",
    "brown",
    "grey",
    "blue-grey",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index] + "-4";
};

const isMobile = computed(() => $q.platform.is.mobile);

const states: Record<string, string> = {
  PENDIENTE: "primary",
  COMPLETADO: "green",
  CANCELADO: "negative",
};

const handleClickItem = (event: Event, item: Visit) => {
  if (event.target instanceof HTMLElement) {
    if (
      event.target.closest("button") ||
      event.target.closest(".q-menu") ||
      event.target.closest(".q-icon") ||
      event.target.closest(".i")
    ) {
      return;
    }
  }
  emit("showDetail", item);
};

const emit = defineEmits<{
  (e: "edit", visit: Visit): void;
  (e: "delete", id: string): void;
  (e: "generateConsent", visit: Visit): void;
  (e: "generateConsent2", visit: Visit): void;
  (e: "registerAnotherPet", id: string): void;
  (e: "rate", visit: Visit, rate?: string): void;
  (e: "showDetail", visit: Visit): void;
}>();
</script>

<template>
  <div
    v-if="showLoading"
    class="text-center q-py-xl full-height flex column items-center justify-center"
  >
    <q-spinner color="primary" size="4rem" class="q-mb-md"></q-spinner>
    <div>Cargando citas...</div>
  </div>
  <div
    v-if="appointments.length === 0 && !showLoading"
    class="text-center q-py-xl text-grey-5 full-height flex column items-center justify-center"
  >
    <q-icon name="event_busy" size="4rem" class="q-mb-md"></q-icon>
    <div>No hay visitas programadas para este día</div>
  </div>
  <template v-if="appointments.length">
    <q-virtual-scroll :items="appointments" class="q-my-sm" v-slot="{ item }">
      <TransitionGroup name="appointments" tag="div">
        <q-item
          :key="item.id"
          clickable
          v-ripple
          @click="handleClickItem($event, item)"
        >
          <q-item-section avatar v-if="!isMobile">
            <div class="column items-center">
              <div class="text-h6 text-weight-bold text-grey-9">
                {{ item.date.clone().format("HH:mm") }}
              </div>
              <div class="text-caption text-grey-5 text-weight-bold">
                {{ item.date.clone().format("DD/MM/YYYY") }}
              </div>
            </div>
          </q-item-section>
          <q-item-section>
            <div class="row items-center q-gutter-x-md no-wrap">
              <q-avatar
                size="48px"
                class="text-weight-bold bg-primary text-white"
              >
                {{ item.petName.charAt(0) }}
              </q-avatar>
              <div style="flex-grow: 1">
                <div class="row items-center q-gutter-x-sm">
                  <div class="text-subtitle1 text-weight-bold text-grey-9">
                    {{ item.petName }}
                  </div>
                  <q-chip
                    dense
                    size="sm"
                    :color="getRandomColor(item.race)"
                    text-color="white"
                    class="text-weight-medium"
                    >{{ item.race }}</q-chip
                  >
                  <q-space />
                  <q-chip
                    dense
                    size="sm"
                    :color="states[item.state]"
                    text-color="white"
                    class="text-weight-medium"
                    >{{ item.state }}</q-chip
                  >
                </div>
                <div
                  class="text-caption text-grey-6 row items-center q-gutter-x-md q-mt-xs no-wrap"
                >
                  <span class="flex items-center"
                    ><q-icon name="person" size="14px" class="q-mr-xs"></q-icon>
                    {{ item.ownerName }}</span
                  >
                  <span class="flex items-center"
                    ><q-icon
                      name="content_cut"
                      size="14px"
                      class="q-mr-xs"
                    ></q-icon>
                    {{ item.cutType }}</span
                  >
                  <span class="flex items-center" v-if="isMobile"
                    ><q-icon name="watch" size="14px" class="q-mr-xs"></q-icon>
                    {{ item.date.clone().format("HH:mm") }}
                  </span>
                </div>
              </div>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round color="grey-5" icon="more_vert">
              <q-menu anchor="bottom right" self="top right">
                <q-list>
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="emit('edit', item)"
                  >
                    <q-item-section avatar>
                      <q-icon name="edit" color="primary" />
                    </q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="emit('registerAnotherPet', item.id)"
                  >
                    <q-item-section avatar>
                      <q-icon name="pets" />
                    </q-item-section>
                    <q-item-section>Registrar otra mascota</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="emit('rate', item, item.feedback)"
                  >
                    <q-item-section avatar>
                      <q-icon name="star" color="yellow" />
                    </q-item-section>
                    <q-item-section>Calificar atención</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="emit('generateConsent', item)"
                  >
                    <q-item-section avatar>
                      <q-icon name="description" color="blue-7" />
                    </q-item-section>
                    <q-item-section
                      >Generar documento de consentimiento</q-item-section
                    >
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="emit('generateConsent2', item)"
                  >
                    <q-item-section avatar>
                      <q-icon name="description" color="blue-7" />
                    </q-item-section>
                    <q-item-section
                      >Generar documento de consentimiento 2</q-item-section
                    >
                  </q-item>
                  <q-separator />
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="emit('delete', item.id)"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </TransitionGroup>
    </q-virtual-scroll>
    <div>
      <div class="text-caption text-grey-5 text-center">
        Son todas las visitas por el momento 😀
      </div>
    </div>
  </template>
</template>

<style scoped>
.appointments-move,
.appointments-enter-active {
  transition: all 0.6s ease;
}
.appointments-enter-from,
.appointments-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
