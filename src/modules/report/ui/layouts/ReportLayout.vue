<script lang="ts" setup>
import { useUserStore } from "@/core/store/useUserStore";
import type { User } from "@/modules/user/domain/user.model";
import { UserRepository } from "@/modules/user/infrastructure/user.repository";
import { VisitRepository } from "@/modules/visit/infrastructure/visit.repository";
import { useQuery } from "@tanstack/vue-query";
import moment from "moment";
import { useQuasar, getCssVar, QSpinnerGears } from "quasar";
import { ref } from "vue";
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

const primaryColor = getCssVar("primary") || "#1976d2";
const loadingReport = ref<string | null>(null);

const monthSelected = ref("");
const customRangeSelected = ref({ from: "", to: "" });
const ratesRangeSelected = ref<{ from: string; to: string } | null | string>({
  from: "",
  to: "",
});

const showLoadingDialog = (message: string) => {
  return $q.dialog({
    message,
    progress: true,
    persistent: true,
    ok: false,
    color: "primary",
    html: true,
  });
};

const handleGenerateReportAll = async (range: QuasarRange) => {
  if (!users.value) return;

  const from = range.from ?? {
    year: range.year,
    month: range.month,
    day: range.day,
  };
  const to = range.to ?? {
    year: range.year,
    month: range.month,
    day: range.day,
  };
  loadingReport.value = "custom";

  const loadingDialog = showLoadingDialog(
    '<div style="text-align: center;"><div class="text-h6 q-mb-sm">Generando reporte personalizado</div><div class="text-caption">Obteniendo visitas del período seleccionado...</div></div>',
  );

  try {
    const fromMoment = moment()
      .year(from.year)
      .month(from.month - 1)
      .date(from.day)
      .startOf("day");

    const toMoment = moment()
      .year(to.year)
      .month(to.month - 1)
      .date(to.day)
      .endOf("day");

    const visits = await getVisits({
      date: { from: fromMoment, to: toMoment },
    });

    if (visits.length === 0) {
      loadingDialog.hide();
      $q.notify({
        type: "warning",
        message: "No se encontraron visitas en el rango seleccionado",
        caption: `${fromMoment.format("DD/MM/YYYY")} - ${toMoment.format(
          "DD/MM/YYYY",
        )}`,
        position: "top",
        timeout: 4000,
        icon: "event_busy",
      });
      return;
    }

    loadingDialog.update({
      message: `<div style="text-align: center;"><div class="text-h6 q-mb-sm">Procesando ${visits.length} visitas</div><div class="text-caption">Generando documento PDF...</div></div>`,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    generateReportOfAll(visits, users.value, [], userStore.userData!.tenantId!);

    loadingDialog.hide();

    $q.notify({
      type: "positive",
      message: "¡Reporte generado exitosamente!",
      caption: `${visits.length} visitas procesadas`,
      position: "top",
      timeout: 3000,
      icon: "check_circle",
      actions: [{ icon: "close", color: "white" }],
    });

    // Limpiar selección
    customRangeSelected.value = { from: "", to: "" };
  } catch (error) {
    loadingDialog.hide();
    $q.notify({
      type: "negative",
      message: "Error al generar el reporte",
      caption: "Por favor, intenta nuevamente",
      position: "top",
      timeout: 4000,
      icon: "error",
      actions: [{ icon: "close", color: "white" }],
    });
  } finally {
    loadingReport.value = null;
  }
};

const handleGenerateReportToday = async () => {
  if (!users.value) return;
  loadingReport.value = "today";

  const loadingDialog = showLoadingDialog(
    '<div style="text-align: center;"><div class="text-h6 q-mb-sm">Generando reporte del día</div><div class="text-caption">Obteniendo visitas de hoy...</div></div>',
  );

  try {
    const visits = await getVisits({
      date: {
        from: moment().startOf("day"),
        to: moment().endOf("day"),
      },
    });

    if (visits.length === 0) {
      loadingDialog.hide();
      $q.notify({
        type: "warning",
        message: "No hay visitas registradas hoy",
        caption: moment().format("DD/MM/YYYY"),
        position: "top",
        timeout: 4000,
        icon: "event_busy",
      });
      return;
    }

    loadingDialog.update({
      message: `<div style="text-align: center;"><div class="text-h6 q-mb-sm">Procesando ${visits.length} visitas</div><div class="text-caption">Generando documento PDF...</div></div>`,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    generateReportOfAll(visits, users.value, [], userStore.userData!.tenantId!);

    loadingDialog.hide();

    $q.notify({
      type: "positive",
      message: "¡Reporte diario generado!",
      caption: `${visits.length} visitas de hoy`,
      position: "top",
      timeout: 3000,
      icon: "check_circle",
      actions: [{ icon: "close", color: "white" }],
    });
  } catch (error) {
    loadingDialog.hide();
    $q.notify({
      type: "negative",
      message: "Error al generar el reporte",
      caption: "Por favor, intenta nuevamente",
      position: "top",
      timeout: 4000,
      icon: "error",
      actions: [{ icon: "close", color: "white" }],
    });
  } finally {
    loadingReport.value = null;
  }
};

const handleGenerateReportMonth = async (range: QuasarRange) => {
  if (!users.value) return;
  loadingReport.value = "month";

  const monthName = moment()
    .year(range.year)
    .month(range.month - 1)
    .format("MMMM YYYY");

  const loadingDialog = showLoadingDialog(
    `<div style="text-align: center;"><div class="text-h6 q-mb-sm">Generando reporte mensual</div><div class="text-caption">${monthName}</div></div>`,
  );

  try {
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
      loadingDialog.hide();
      $q.notify({
        type: "warning",
        message: "No hay visitas en este mes",
        caption: monthName,
        position: "top",
        timeout: 4000,
        icon: "event_busy",
      });
      return;
    }

    loadingDialog.update({
      message: `<div style="text-align: center;"><div class="text-h6 q-mb-sm">Procesando ${visits.length} visitas</div><div class="text-caption">Generando documento PDF...</div></div>`,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    generateByMonth(visits, users.value, [], userStore.userData!.tenantId!);

    loadingDialog.hide();

    $q.notify({
      type: "positive",
      message: "¡Reporte mensual generado!",
      caption: `${visits.length} visitas en ${monthName}`,
      position: "top",
      timeout: 3000,
      icon: "check_circle",
      actions: [{ icon: "close", color: "white" }],
    });

    // Limpiar selección
    monthSelected.value = "";
  } catch (error) {
    loadingDialog.hide();
    $q.notify({
      type: "negative",
      message: "Error al generar el reporte",
      caption: "Por favor, intenta nuevamente",
      position: "top",
      timeout: 4000,
      icon: "error",
      actions: [{ icon: "close", color: "white" }],
    });
  } finally {
    loadingReport.value = null;
  }
};

const handleGenerateReportRates = async (range: QuasarRange) => {
  if (!users.value) return;

  const from = range.from ?? {
    year: range.year,
    month: range.month,
    day: range.day,
  };
  const to = range.to ?? {
    year: range.year,
    month: range.month,
    day: range.day,
  };

  loadingReport.value = "rates";

  const loadingDialog = showLoadingDialog(
    '<div style="text-align: center;"><div class="text-h6 q-mb-sm">Generando reporte de calificaciones</div><div class="text-caption">Analizando valoraciones del período...</div></div>',
  );

  try {
    const fromMoment = moment()
      .year(from.year)
      .month(from.month - 1)
      .date(from.day)
      .startOf("day");

    const toMoment = moment()
      .year(to.year)
      .month(to.month - 1)
      .date(to.day)
      .endOf("day");

    const visits = await getVisits({
      date: { from: fromMoment, to: toMoment },
    });

    if (visits.length === 0) {
      loadingDialog.hide();
      $q.notify({
        type: "warning",
        message: "No se encontraron visitas con calificaciones",
        caption: `${fromMoment.format("DD/MM/YYYY")} - ${toMoment.format(
          "DD/MM/YYYY",
        )}`,
        position: "top",
        timeout: 4000,
        icon: "event_busy",
      });
      return;
    }

    loadingDialog.update({
      message: `<div style="text-align: center;"><div class="text-h6 q-mb-sm">Procesando ${visits.length} calificaciones</div><div class="text-caption">Generando análisis estadístico...</div></div>`,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    generateRateReport(visits, userStore.userData!.tenantId!);

    loadingDialog.hide();

    $q.notify({
      type: "positive",
      message: "¡Reporte de calificaciones generado!",
      caption: `${visits.length} valoraciones analizadas`,
      position: "top",
      timeout: 3000,
      icon: "check_circle",
      actions: [{ icon: "close", color: "white" }],
    });

    // Limpiar selección
    ratesRangeSelected.value = { from: "", to: "" };
  } catch (error) {
    loadingDialog.hide();
    $q.notify({
      type: "negative",
      message: "Error al generar el reporte",
      caption: "Por favor, intenta nuevamente",
      position: "top",
      timeout: 4000,
      icon: "error",
      actions: [{ icon: "close", color: "white" }],
    });
  } finally {
    loadingReport.value = null;
  }
};

interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void | Promise<void>;
  hasDatePicker?: boolean;
  datePickerType?: "month" | "range";
  onDateSelect?: (range: QuasarRange) => void | Promise<void>;
  modelValue?: any;
}

const reportOptions: ReportOption[] = [
  {
    id: "today",
    title: "Reporte Diario",
    description: "Genera el reporte de hoy",
    icon: "today",
    color: "primary",
    action: handleGenerateReportToday,
  },
  {
    id: "month",
    title: "Reporte Mensual",
    description: "Selecciona un mes",
    icon: "date_range",
    color: "secondary",
    hasDatePicker: true,
    datePickerType: "month",
    action: () => {},
    onDateSelect: handleGenerateReportMonth,
    modelValue: monthSelected,
  },
  {
    id: "custom",
    title: "Reporte Personalizado",
    description: "Elige un rango de fechas",
    icon: "calendar_today",
    color: "accent",
    hasDatePicker: true,
    datePickerType: "range",
    action: () => {},
    onDateSelect: handleGenerateReportAll,
    modelValue: customRangeSelected,
  },
  {
    id: "rates",
    title: "Reporte de Calificaciones",
    description: "Análisis de valoraciones",
    icon: "star_rate",
    color: "warning",
    hasDatePicker: true,
    datePickerType: "range",
    action: () => {},
    onDateSelect: handleGenerateReportRates,
    modelValue: ratesRangeSelected,
  },
];
</script>

<template>
  <q-page class="reports-page">
    <div class="reports-container">
      <!-- Header -->
      <div class="reports-header" :style="{ background: primaryColor }">
        <q-icon name="assessment" size="40px" />
        <h1 class="reports-title">Reportes</h1>
        <p class="reports-subtitle">
          Genera reportes de visitas y calificaciones
        </p>
      </div>

      <!-- Cards de reportes -->
      <div class="reports-grid">
        <q-card
          v-for="report in reportOptions"
          :key="report.id"
          class="report-card"
          flat
          bordered
        >
          <q-card-section class="report-card-content">
            <div class="report-icon-wrapper" :class="`bg-${report.color}`">
              <q-icon :name="report.icon" size="32px" color="white" />
            </div>

            <div class="report-info">
              <h3 class="report-title">{{ report.title }}</h3>
              <p class="report-description">{{ report.description }}</p>
            </div>

            <div class="report-action">
              <q-btn
                v-if="!report.hasDatePicker"
                :color="report.color"
                unelevated
                rounded
                :loading="loadingReport === report.id"
                @click="report.action"
                no-caps
                class="action-btn"
              >
                <template v-slot:loading>
                  <q-spinner-gears />
                </template>
                <q-icon name="play_arrow" left />
                Generar
              </q-btn>

              <q-btn
                v-else
                :color="report.color"
                unelevated
                rounded
                :loading="loadingReport === report.id"
                no-caps
                class="action-btn"
              >
                <template v-slot:loading>
                  <q-spinner-gears />
                </template>
                <q-icon name="calendar_month" left />
                Seleccionar
                <q-popup-proxy>
                  <q-date
                    v-if="report.datePickerType === 'month'"
                    v-model="report.modelValue.value"
                    emit-immediately
                    default-view="Months"
                    @update:model-value="
                      (_v, _r, val) => report.onDateSelect?.(val)
                    "
                    :color="report.color"
                    today-btn
                  />
                  <q-date
                    v-else
                    v-model="report.modelValue.value"
                    range
                    @update:model-value="
                      (_v, _r, val) => {
                        report.onDateSelect?.(val);
                      }
                    "
                    :color="report.color"
                    today-btn
                  />
                </q-popup-proxy>
              </q-btn>
            </div>
          </q-card-section>

          <!-- Indicador de fecha seleccionada -->
          <q-card-section
            v-if="
              report.hasDatePicker &&
              report.modelValue?.value &&
              (typeof report.modelValue.value === 'string'
                ? report.modelValue.value
                : report.modelValue.value.from && report.modelValue.value.to)
            "
            class="selected-date-section"
          >
            <q-chip
              :color="report.color"
              text-color="white"
              icon="event"
              size="sm"
              dense
            >
              <template v-if="report.datePickerType === 'month'">
                {{
                  moment(report.modelValue.value, "YYYY/MM/DD").format(
                    "MMMM YYYY",
                  )
                }}
              </template>
              <template v-else-if="report.modelValue.value.from">
                {{
                  moment(report.modelValue.value.from, "YYYY/MM/DD").format(
                    "DD/MM/YY",
                  )
                }}
                -
                {{
                  moment(report.modelValue.value.to, "YYYY/MM/DD").format(
                    "DD/MM/YY",
                  )
                }}
              </template>
              <template v-else>
                {{
                  moment(report.modelValue.value, "YYYY/MM/DD").format(
                    "DD/MM/YY",
                  )
                }}
              </template>
            </q-chip>
          </q-card-section>
        </q-card>
      </div>

      <!-- Info adicional -->
      <div class="reports-info">
        <q-icon name="info" size="20px" color="grey-7" />
        <p>Los reportes se descargarán automáticamente en formato PDF</p>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.reports-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.reports-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.reports-header {
  color: white;
  padding: 40px 24px;
  text-align: center;
  margin-bottom: 32px;
}

.reports-header q-icon {
  opacity: 0.95;
  margin-bottom: 12px;
}

.reports-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.reports-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 16px 32px;
}

.report-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.report-card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 200px;
}

.report-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.report-info {
  flex: 1;
}

.report-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.report-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
}

.report-action {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  min-width: 140px;
  padding: 10px 20px;
  font-weight: 500;
  font-size: 14px;
}

.selected-date-section {
  padding: 12px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.reports-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  color: #6c757d;
  font-size: 14px;
}

.reports-info p {
  margin: 0;
}

@media (max-width: 600px) {
  .reports-header {
    padding: 32px 16px;
  }

  .reports-title {
    font-size: 28px;
  }

  .reports-subtitle {
    font-size: 14px;
  }

  .reports-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 12px 24px;
  }

  .report-card-content {
    padding: 20px;
    min-height: auto;
  }

  .report-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .report-title {
    font-size: 16px;
  }

  .report-description {
    font-size: 13px;
  }

  .action-btn {
    min-width: 120px;
    padding: 8px 16px;
    font-size: 13px;
  }

  .selected-date-section {
    padding: 10px 20px;
  }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .reports-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
