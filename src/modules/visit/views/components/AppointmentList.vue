<script lang="ts" setup>
import type { Visit } from "../../domain/visit.model";
const { appointments, showLoading } = defineProps<{
  appointments: Array<Visit>;
  showLoading: boolean;
}>();

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

const emit = defineEmits<{
  (e: "edit", id: string): void;
  (e: "delete", id: string): void;
  (e: "generateConsent", id: string): void;
  (e: "generateConsent2", id: string): void;
  (e: "registerAnotherPet", id: string): void;
  (e: "rate", id: string, rate?: string): void;
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
    <TransitionGroup name="appointments" tag="div">
      <q-card v-for="apt in appointments" :key="apt.id" flat>
        <q-card-section
          class="row items-center justify-between no-wrap q-py-md"
        >
          <div class="row items-center q-gutter-x-md col-grow">
            <div
              class="column items-center"
              style="border-right: 1px solid #f0f0f0; min-width: 80px"
            >
              <div class="text-h6 text-weight-bold text-grey-9">
                {{ apt.date.clone().format("HH:mm") }}
              </div>
              <div class="text-caption text-grey-5 text-weight-bold">
                {{ apt.date.clone().format("DD/MM/YYYY") }}
              </div>
            </div>
            <div class="row items-center q-gutter-x-md">
              <q-avatar
                size="48px"
                class="text-weight-bold bg-primary text-white"
              >
                {{ apt.petName.charAt(0) }}
              </q-avatar>
              <div>
                <div class="row items-center q-gutter-x-sm">
                  <div class="text-subtitle1 text-weight-bold text-grey-9">
                    {{ apt.petName }}
                  </div>
                  <q-chip
                    dense
                    size="sm"
                    :color="getRandomColor(apt.race)"
                    text-color="white"
                    class="text-weight-medium"
                    >{{ apt.race }}</q-chip
                  >
                </div>
                <div
                  class="text-caption text-grey-6 row items-center q-gutter-x-md q-mt-xs"
                >
                  <span class="flex items-center"
                    ><q-icon name="person" size="14px" class="q-mr-xs"></q-icon>
                    {{ apt.ownerName }}</span
                  >
                  <span class="flex items-center"
                    ><q-icon
                      name="content_cut"
                      size="14px"
                      class="q-mr-xs"
                    ></q-icon>
                    {{ apt.cutType }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="row items-center q-gutter-x-md gt-xs">
            <div class="text-right gt-sm">
              <div class="text-subtitle2 text-weight-bold text-grey-9">
                $ {{ apt.price.toFixed(2) }}
              </div>
              <div class="text-caption text-grey-5">Costo total</div>
            </div>
            <q-badge
              :color="
                apt.state.toLowerCase() === 'completado'
                  ? 'green-1'
                  : 'orange-1'
              "
              :text-color="
                apt.state.toLowerCase() === 'completado'
                  ? 'green-8'
                  : 'orange-9'
              "
              class="q-px-sm q-py-xs text-weight-bold text-uppercase"
              style="font-size: 11px; letter-spacing: 0.5px"
            >
              {{ apt.state }}
            </q-badge>
            <q-btn flat round color="grey-5" icon="more_vert">
              <q-menu anchor="bottom right" self="top right">
                <q-list>
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="emit('edit', apt.id)"
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
                    @click="emit('registerAnotherPet', apt.id)"
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
                    @click="emit('rate', apt.id, apt.feedback)"
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
                    @click="emit('generateConsent', apt.id)"
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
                    @click="emit('generateConsent2', apt.id)"
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
                    @click="emit('delete', apt.id)"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>
    </TransitionGroup>
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
