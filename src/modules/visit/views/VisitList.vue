<script lang="ts" setup>
import StatCards from "./components/StatCards.vue";
import CalendarStrip from "./components/CalendarStrip.vue";
import AppointmentList from "./components/AppointmentList.vue";
import Actions from "./components/Actions.vue";
import VisitFormDialog from "./components/VisitFormDialog.vue";
import { VisitRepository } from "@/modules/visit/infrastructure/visit.repository";
import { computed, ref } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import type { Visit, VisitCreate } from "../domain/visit.model";
import moment from "moment";
import { useCalendarStore } from "@/core/store/useCalendarStore";
import { useQuasar } from "quasar";

const $q = useQuasar();
const modalOpen = ref(false);
const calendarStore = useCalendarStore();

const selectedDate = computed(() =>
  calendarStore.selectedDate.format("YYYY-MM-DD"),
);
const { getVisits, createVisit, deleteVisit, rateVisit } =
  VisitRepository("CH0003");
const { isLoading, isFetching, data, error, refetch } = useQuery<
  Visit[],
  Error,
  Visit[]
>({
  queryKey: [
    "visits",
    {
      selectedDate,
    },
  ],
  queryFn: () => {
    return getVisits({
      date: {
        from: calendarStore.selectedDate,
        to: calendarStore.selectedDate,
      },
    });
  },
  initialData: [],
  refetchOnWindowFocus: true,
});

const showError = computed(() => error.value);
const showLoading = computed(() => isLoading.value || isFetching.value);

const { mutate } = useMutation({
  mutationFn: (newVisit: VisitCreate) => createVisit(newVisit),
  onMutate() {
    $q.notify({
      type: "info",
      message: "Registrando visita...",
      timeout: 1000,
    });
  },
  onSuccess() {
    $q.notify({
      type: "positive",
      message: "Visita registrada con éxito",
      timeout: 2000,
    });
    refetch();
  },
  onError(error) {
    $q.notify({
      type: "negative",
      message: `Error al registrar la visita: ${error.message}`,
      timeout: 3000,
    });
  },
});

const days = computed(() => {
  const daysArray = [];
  const totalDays = calendarStore.range.end.date();

  for (let i = 1; i <= totalDays; i++) {
    const day = moment({
      year: calendarStore.range.start.year(),
      month: calendarStore.range.start.month(),
      day: i,
    });

    daysArray.push(day);
  }

  return daysArray;
});

const handleSubmit = (visit: VisitCreate) => {
  mutate(visit);
  modalOpen.value = false;
};

const handleDelete = (id: string) => {
  $q.dialog({
    title: "Confirmar eliminación",
    message: "¿Está seguro de que desea eliminar esta visita?",
    cancel: {
      label: "Cancelar",
      color: "primary",
    },
    persistent: true,
    ok: {
      label: "Eliminar",
      color: "negative",
    },
  }).onOk(() => {
    deleteVisit(id)
      .then(() => {
        $q.notify({
          type: "positive",
          message: "Visita eliminada con éxito",
          timeout: 2000,
        });
        refetch();
      })
      .catch((error) => {
        $q.notify({
          type: "negative",
          message: `Error al eliminar la visita: ${error.message}`,
          timeout: 3000,
        });
      });
  });
};

const handleRate = (id: string, rate?: string) => {
  $q.dialog({
    title: "Calificar atención",
    message: "¿Cómo calificaría la atención recibida?",
    options: {
      type: "radio",
      model: rate ?? "great",
      items: [
        { label: "😃 Excelente", value: "great" },
        { label: "😐 Regular", value: "medium" },
        { label: "😞 Mala", value: "bad" },
      ],
    },
    ok: {
      label: "Calificar",
      color: "primary",
    },
    cancel: {
      label: "Cancelar",
      color: "negative",
    },
  }).onOk((rating) => {
    rateVisit(id, rating)
      .then(() => {
        $q.notify({
          type: "positive",
          message: "Gracias por calificar la atención.",
          timeout: 2000,
        });
        refetch();
      })
      .catch((error) => {
        $q.notify({
          type: "negative",
          message: `Error al calificar la atención: ${error.message}`,
          timeout: 3000,
        });
      });
  });
};

const handleChangeRange = (
  range: { from: string; to: string } | null | string,
) => {
  if (!range) {
    return;
  }

  if (typeof range === "object") {
    const fromDate = moment(range.from, "DD/MM/YYYY");
    const toDate = moment(range.to, "DD/MM/YYYY");
    calendarStore.setRange(fromDate, toDate);
    calendarStore.setSelectedDate(fromDate);
  } else if (typeof range === "string") {
    const fromDate = moment(range, "DD/MM/YYYY");
    calendarStore.setRange(fromDate, fromDate);
    calendarStore.setSelectedDate(fromDate);
  }
  refetch();
};
</script>

<template>
  <q-page class="q-pa-lg full-height">
    <div v-if="showError" class="text-center q-py-xl text-negative">
      <q-icon name="error" size="4rem" class="q-mb-md"></q-icon>
      <div>
        Ocurrió un error al cargar las visitas. Por favor, intente nuevamente.
      </div>
    </div>

    <div v-else class="full-height flex column" style="flex-wrap: nowrap">
      <StatCards />
      <Actions @create="modalOpen = true" @dateRange="handleChangeRange" />
      <CalendarStrip
        :selectedDate="calendarStore.selectedDate"
        @update:selectedDate="calendarStore.selectedDate = $event"
        :days="days"
      />
      <div style="flex-grow: 1; max-height: 100%; overflow-y: auto">
        <AppointmentList
          :appointments="data"
          :showLoading="showLoading"
          @delete="handleDelete"
          @rate="handleRate"
        />
      </div>
    </div>
    <VisitFormDialog v-model="modalOpen" @submit="handleSubmit" />
  </q-page>
</template>

<style scoped>
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease-out;
}

.list-move {
  transition: transform 0.25s ease;
}

.calendar-active {
  animation: pulseSelected 0.25s ease-out;
}

@keyframes pulseSelected {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
}
</style>
