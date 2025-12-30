<script lang="ts" setup>
import { computed } from "vue";
import { useQuasar } from "quasar";
import type { Visit } from "../../domain/visit.model";

const visits = defineModel<Visit[]>({
  type: Array as () => Visit[],
  required: true,
});

const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.sm);
const cards = [
  {
    title: "Citas para hoy",
    value: "12",
    icon: "event",
    iconBg: "bg-blue-1 text-blue-8",
  },
  {
    title: "Pendientes",
    value: "5",
    icon: "schedule",
    iconBg: "bg-orange-1 text-orange-8",
  },
  {
    title: "Completados",
    value: "7",
    icon: "check_circle",
    iconBg: "bg-green-1 text-green-8",
  },
  {
    title: "Ingresos Estimados",
    value: "$ 12,400",
    icon: "attach_money",
    iconBg: "bg-grey-2 text-grey-8",
  },
];

const stats = computed(() => {
  const pendingVisits = visits.value.filter(
    (visit) => visit.state === "PENDIENTE",
  );

  const completedVisits = visits.value.filter(
    (visit) => visit.state === "COMPLETADO",
  );

  const estimatedIncome = completedVisits.reduce(
    (total, visit) =>
      total +
      (visit.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0),
    0,
  );

  return {
    visitsToday: visits.value.length,
    pendingVisits: pendingVisits.length,
    completedVisits: completedVisits.length,
    estimatedIncome,
  };
});
</script>

<template>
  <div>
    <!-- Desktop and Tablet View -->
    <div class="row q-col-gutter-md q-mb-md" v-if="!isMobile">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div
                class="text-caption text-grey-6 text-uppercase text-weight-bold"
              >
                Citas para hoy
              </div>
              <div class="text-h4 text-weight-bold text-grey-9 q-mt-xs">
                {{ stats.visitsToday }}
              </div>
            </div>
            <div class="bg-blue-1 text-blue-8 q-pa-sm rounded-borders">
              <q-icon name="event" size="24px"></q-icon>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div
                class="text-caption text-grey-6 text-uppercase text-weight-bold"
              >
                Pendientes
              </div>
              <div class="text-h4 text-weight-bold text-grey-9 q-mt-xs">
                {{ stats.pendingVisits }}
              </div>
            </div>
            <div class="bg-orange-1 text-orange-8 q-pa-sm rounded-borders">
              <q-icon name="schedule" size="24px"></q-icon>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div
                class="text-caption text-grey-6 text-uppercase text-weight-bold"
              >
                Completados
              </div>
              <div class="text-h4 text-weight-bold text-grey-9 q-mt-xs">
                {{ stats.completedVisits }}
              </div>
            </div>
            <div class="bg-green-1 text-green-8 q-pa-sm rounded-borders">
              <q-icon name="check_circle" size="24px"></q-icon>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div
                class="text-caption text-grey-6 text-uppercase text-weight-bold"
              >
                Ingresos Estimados
              </div>
              <div class="text-h4 text-weight-bold text-grey-9 q-mt-xs">
                {{ stats.estimatedIncome.toFixed(2) }}Bs.
              </div>
            </div>
            <div class="bg-grey-2 text-grey-8 q-pa-sm rounded-borders">
              <q-icon name="attach_money" size="24px"></q-icon>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Mobile View -->
    <q-expansion-item v-else expand-separator class="q-mb-sm" dense>
      <template v-slot:header>
        <div
          class="text-caption text-grey-6 text-uppercase text-weight-bold full-width flex items-center"
        >
          Estadísticas
        </div>
      </template>
      <div>
        <div
          v-for="(card, index) in cards"
          :key="index"
          class="q-pa-md row items-center justify-between"
        >
          <div>
            <div
              class="text-caption text-grey-6 text-uppercase text-weight-bold"
            >
              {{ card.title }}
            </div>
            <div class="text-h4 text-weight-bold text-grey-9 q-mt-xs">
              {{ card.value }}
            </div>
          </div>
          <div :class="card.iconBg" class="q-pa-sm rounded-borders">
            <q-icon :name="card.icon" size="24px"></q-icon>
          </div>
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>
