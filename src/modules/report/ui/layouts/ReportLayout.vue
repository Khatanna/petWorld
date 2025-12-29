<script lang="ts" setup>
import { useUserStore } from "@/core/store/useUserStore";
import type { User } from "@/modules/user/domain/user.model";
import { UserRepository } from "@/modules/user/infrastructure/user.repository";
import { VisitRepository } from "@/modules/visit/infrastructure/visit.repository";
import { useQuery } from "@tanstack/vue-query";
import moment from "moment";
import { useQuasar } from "quasar";
import {
  generateByMonth,
  generateRateReport,
  generateReportOfAll,
} from "../../infrastructure/report.repository";

const $q = useQuasar();
const userStore = useUserStore();

const { getUsers } = UserRepository(userStore.userData!.tenantId!);
const { getVisits } = VisitRepository(userStore.userData!.tenantId!);
const { data: users } = useQuery({
  queryKey: ["getUsersForReport"],
  queryFn: async () => {
    return getUsers();
  },
  select: (data) => {
    return data.reduce((acc, user) => {
      acc[user.id] = user;

      return acc;
    }, {} as Record<string, User>);
  },
});

type QuasarRange = {
  year: number;
  month: number;
  day: number;
  from?: {
    year: number;
    month: number;
    day: number;
  };
  to?: {
    year: number;
    month: number;
    day: number;
  };
};

// const isLoadingUsers = computed(() => isLoading.value || isFetching.value);

const handleGenerateReportAll = async (range: QuasarRange) => {
  if (!users.value) return;

  const visits = await getVisits({
    date: {
      from: moment()
        .year(range.from!.year)
        .month(range.from!.month - 1)
        .date(range.from!.day)
        .startOf("day"),
      to: moment()
        .year(range.to!.year)
        .month(range.to!.month - 1)
        .date(range.to!.day)
        .endOf("day"),
    },
  });

  if (visits.length === 0) {
    $q.notify({
      type: "warning",
      message: "No hay visitas en el rango de fechas seleccionado.",
      timeout: 3000,
    });
    return;
  }

  generateReportOfAll(visits, users.value, [], userStore.userData!.tenantId!);
};

const handleGenerateReportToday = async () => {
  if (!users.value) return;

  const visits = await getVisits({
    date: {
      from: moment().startOf("day"),
      to: moment().endOf("day"),
    },
  });

  if (visits.length === 0) {
    $q.notify({
      type: "warning",
      message: "No hay visitas el día de hoy.",
      timeout: 3000,
    });
    return;
  }

  generateReportOfAll(visits, users.value, [], userStore.userData!.tenantId!);
};

const handleGenerateReportMonth = async (range: QuasarRange) => {
  if (!users.value) return;

  const visits = await getVisits({
    date: {
      from: moment()
        .year(range.year)
        .month(range.month - 1)
        .startOf("month"),
      to: moment()
        .year(range.year)
        .month(range.month - 1)
        .endOf("month"),
    },
  });

  if (visits.length === 0) {
    $q.notify({
      type: "warning",
      message: "No hay visitas en el mes actual.",
      timeout: 3000,
    });
    return;
  }

  generateByMonth(visits, users.value, [], userStore.userData!.tenantId!);
};

const handleGenerateReportRates = async (range: QuasarRange) => {
  if (!users.value) return;

  const visits = await getVisits({
    date: {
      from: moment()
        .year(range.from!.year)
        .month(range.from!.month - 1)
        .date(range.from!.day)
        .startOf("day"),
      to: moment()
        .year(range.to!.year)
        .month(range.to!.month - 1)
        .date(range.to!.day)
        .endOf("day"),
    },
  });

  if (visits.length === 0) {
    $q.notify({
      type: "warning",
      message: "No hay visitas en el rango de fechas seleccionado.",
      timeout: 3000,
    });
    return;
  }

  generateRateReport(visits, userStore.userData!.tenantId!);
};
</script>

<template>
  <q-page class="full-height" padding>
    <div class="col justify-center">
      <div class="full-width q-my-sm">
        <q-btn
          class="full-width"
          label="Generar Reporte mensual"
          color="primary"
          stack
          icon="date_range"
          glossy
        >
          <q-popup-proxy>
            <q-date
              emit-immediately
              default-view="Months"
              @update:model-value="
                (_v, _r, val) => handleGenerateReportMonth(val)
              "
              model-value=""
            />
          </q-popup-proxy>
        </q-btn>
      </div>
      <div class="full-width q-my-sm">
        <q-btn
          class="full-width"
          label="Generar Reporte diario"
          color="primary"
          icon="today"
          @click="handleGenerateReportToday"
          stack
          glossy
        />
      </div>
      <div class="full-width q-my-sm">
        <q-btn
          class="full-width"
          label="Generar Reporte personalizado"
          color="primary"
          icon="calendar_today"
          stack
          glossy
        >
          <q-popup-proxy>
            <q-date
              range
              @update:model-value="
                (_v, _r, val) => handleGenerateReportAll(val)
              "
              :model-value="{
                from: '',
                to: '',
              }"
            >
            </q-date>
          </q-popup-proxy>
        </q-btn>
      </div>
      <div class="full-width q-my-sm">
        <q-btn
          class="full-width"
          label="Generar Reporte calificaciones"
          color="primary"
          icon="star_rate"
          stack
          glossy
        >
          <q-popup-proxy>
            <q-date
              range
              @update:model-value="
                (_v, _r, val) => handleGenerateReportRates(val)
              "
              :model-value="{
                from: '',
                to: '',
              }"
            >
            </q-date>
          </q-popup-proxy>
        </q-btn>
      </div>
    </div>
  </q-page>
</template>
