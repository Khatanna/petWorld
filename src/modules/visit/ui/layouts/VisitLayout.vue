<script lang="ts" setup>
import { useCalendarStore } from "@/core/store/useCalendarStore";
import { useUserStore } from "@/core/store/useUserStore";
import { VisitRepository } from "@/modules/visit/infrastructure/visit.repository";
import { useMutation, useQuery } from "@tanstack/vue-query";
import moment from "moment";
import { useQuasar } from "quasar";
import { computed, ref } from "vue";
import AvatarUser from "@/components/AvatarUser.vue";
import type { Visit, VisitCreate } from "../../domain/visit.model";
import { useFormStore } from "../store/useFormStore";
import StatCards from "../components/StatCards.vue";
import Actions from "../components/Actions.vue";
import CalendarStrip from "../components/CalendarStrip.vue";
import AppointmentList from "../components/AppointmentList.vue";
import VisitFormDialog from "../components/VisitFormDialog.vue";
import PrimaryConsentForm from "../components/PrimaryConsentForm.vue";
import axios from "axios";
import Signature from "../components/Signature.vue";
import SecondConsentForm from "../components/SecondConsentForm.vue";

const $q = useQuasar();
const modalOpen = ref(false);
const detailOpen = ref(false);
const primaryConcentFormOpen = ref(false);
const secondConcentFormOpen = ref(false);
const signatureOpen = ref(false);
const signature = ref<string | null>(null);
const calendarStore = useCalendarStore();
const userStore = useUserStore();
const isMobile = computed(() => $q.platform.is.mobile);
const selectedVisit = ref<Visit | null>(null);

const selectedVisitForDialog = computed(() => {
  return {
    ...selectedVisit.value,
    id: selectedVisit.value ? selectedVisit.value.id! : "",
    price: selectedVisit.value ? selectedVisit.value.price.toFixed(2) : "",
    date: selectedVisit.value
      ? selectedVisit.value.date.clone().format("dddd, MMMM YYYY - HH:mm")
      : "",
    payments: selectedVisit.value
      ? selectedVisit.value.payments?.map((payment) => ({
          ...payment,
          amount: payment.amount.toFixed(2),
          date: payment.date.clone().format("dddd, MMMM YYYY - HH:mm"),
        }))
      : [],
    ac: selectedVisit.value
      ? selectedVisit.value.payments
          ?.reduce((acc, item) => acc + item.amount, 0)
          .toFixed(2)
      : "",
    balance: selectedVisit.value
      ? (
          selectedVisit.value.price -
          (selectedVisit.value.payments?.reduce(
            (acc, item) => acc + item.amount,
            0,
          ) ?? 0)
        ).toFixed(2)
      : "",
    bathed: Boolean(selectedVisit.value?.bathed),
    brushed: Boolean(selectedVisit.value?.brushed),
    choped: Boolean(selectedVisit.value?.choped),
  };
});

const selectedDate = computed(() =>
  calendarStore.selectedDate.format("YYYY-MM-DD"),
);
const {
  getVisits,
  createVisit,
  deleteVisit,
  rateVisit,
  editVisit,
  changeState,
  toggleService,
  setPrimaryConsent,
  setSecondaryConsent,
  saveDocument,
} = VisitRepository(userStore.userData!.tenantId!);
const { isLoading, isFetching, data, error, refetch } = useQuery({
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
  refetchOnWindowFocus: false,
});

const showError = computed(() => error.value);
const showLoading = computed(() => isLoading.value || isFetching.value);

const { mutate: createVisitMutation } = useMutation({
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

const { mutate: updateVisitMutation } = useMutation({
  mutationFn: ({ visit, visitId }: { visitId: string; visit: Visit }) =>
    editVisit(visitId, visit),
  onMutate() {
    $q.notify({
      type: "info",
      message: "Actualizando visita...",
      timeout: 1000,
    });
  },
  onSuccess() {
    $q.notify({
      type: "positive",
      message: "Visita actualizada con éxito",
      timeout: 2000,
    });
    refetch();
  },
  onError(error) {
    $q.notify({
      type: "negative",
      message: `Error al actualizar la visita: ${error.message}`,
      timeout: 3000,
    });
  },
});

const { mutate: changeStateMutation } = useMutation({
  mutationFn: (data: { visitId: string; state: string }) => {
    return changeState(data.visitId, data.state);
  },
  onMutate() {
    $q.notify({
      type: "info",
      message: "Cambiando estado de la visita...",
      timeout: 1000,
    });
  },
  onSuccess() {
    $q.notify({
      type: "positive",
      message: "Estado de la visita actualizado.",
      timeout: 2000,
    });
    refetch();
  },
  onError(error) {
    $q.notify({
      type: "negative",
      message: `Error al cambiar el estado: ${error.message}`,
      timeout: 3000,
    });
  },
});

const { mutate: toggleServiceMutation } = useMutation({
  mutationFn: (data: {
    visitId: string;
    userId: string;
    service: "brushed" | "bathed" | "choped";
  }) => {
    return toggleService(data.visitId, data.userId, data.service);
  },
  onMutate() {
    $q.notify({
      type: "info",
      message: "Actualizando estado de baño...",
      timeout: 1000,
    });
  },
  onSuccess() {
    $q.notify({
      type: "positive",
      message: "Estado de baño actualizado.",
      timeout: 2000,
    });
    refetch();
  },
  onError(error) {
    $q.notify({
      type: "negative",
      message: `Error al actualizar el estado de baño: ${error.message}`,
      timeout: 3000,
    });
  },
});

const handleUpdateService = (service: "brushed" | "bathed" | "choped") => {
  if (!selectedVisit.value) {
    return;
  }
  toggleServiceMutation({
    visitId: selectedVisit.value.id!,
    userId: userStore.userData!.uid!,
    service,
  });
  detailOpen.value = false;
};

const handleSubmit = (data: VisitCreate | Visit) => {
  if (formStore.mode === "edit") {
    const visit = data as Visit;
    updateVisitMutation({
      visit,
      visitId: visit.id!,
    });
  } else {
    const visit = data as VisitCreate;

    createVisitMutation(visit);
  }
  modalOpen.value = false;
};

const handleChangeState = async (visitId: string, state: string) => {
  changeStateMutation({ visitId, state });
  detailOpen.value = false;
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

const handleDetail = (visit: Visit) => {
  detailOpen.value = true;
  selectedVisit.value = visit;
};

const handleOpenPrimaryConsentForm = (visit: Visit) => {
  selectedVisit.value = visit;

  if (visit.primaryConsent) {
    window.open(visit.primaryConsent.documentUrl, "_blank");
    return;
  }

  primaryConcentFormOpen.value = true;
};

const handleOpenSecondaryConsentForm = (visit: Visit) => {
  selectedVisit.value = visit;

  if (visit.secondaryConsent) {
    window.open(visit.secondaryConsent.documentUrl, "_blank");
    return;
  }

  secondConcentFormOpen.value = true;
};

const isSignatureProvided = computed(() => !!signature.value);

// Modify handleGenerateConsent to clear the signature after generating the document
const handleGenerateConsent = async (data: any) => {
  if (!selectedVisit.value) {
    return;
  }

  if (!signature.value && !selectedVisit.value.primaryConsent) {
    signatureOpen.value = true;
    return;
  }

  const docUrl = "https://wow-telecom.com/docx";
  const response = await axios.post(
    docUrl,
    {
      pet: selectedVisit.value.petName,
      race: selectedVisit.value.race,
      color: selectedVisit.value.color,
      owner: selectedVisit.value.ownerName,
      address: "",
      phoneNumber: selectedVisit.value.phoneNumber,
      signature: signature.value,
      xs: data.size === "XS" ? "X" : "",
      s: data.size === "S" ? "X" : "",
      m: data.size === "M" ? "X" : "",
      l: data.size === "L" ? "X" : "",
      xl: data.size === "XL" ? "X" : "",
      xxl: data.size === "XXL" ? "X" : "",
      observaciones: data.observation || "",
      p: data.details.Pulgas ? "X" : "",
      g: data.details.Garrapatas ? "X" : "",
      otros: data.details.Otros ? "X" : "",
      a1: data.antecedentes.Ansiedad ? "X" : "",
      a2: data.antecedentes.Agresividad ? "X" : "",
      a3: data.antecedentes.Asustadizo ? "X" : "",
      e: data.behavior === "Excelente" ? "X" : "",
      r: data.behavior === "Regular" ? "X" : "",
      b: data.behavior === "Bueno" ? "X" : "",
      ml: data.behavior === "Malo" ? "X" : "",
      si: data.ownerAuthorization === "Sí" ? "X" : "",
      no: data.ownerAuthorization === "No" ? "X" : "",
      baño: data.serviceType === "Baño" ? "X" : "",
      mnt: data.serviceType === "Mantención" ? "X" : "",
      sc: data.serviceType === "Servicio completo" ? "X" : "",
    },
    {
      responseType: "blob",
      headers: {
        tenantId: "CH0002",
        template: "concentimiento_peluqueria_template.docx",
      },
    },
  );

  const fileBlob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  primaryConcentFormOpen.value = false;

  const documentUrl = await saveDocument(
    selectedVisit.value,
    fileBlob,
    userStore.userData!.uid!,
  );

  await setPrimaryConsent(selectedVisit.value.id, {
    ...data,
    documentUrl,
  });

  $q.notify({
    type: "positive",
    message: "Documento guardado con éxito.",
    timeout: 2000,
  });

  window.open(documentUrl, "_blank");
  signature.value = null; // Clear the signature after generating the document
  refetch();
};

// Modify handleGenerateConsent2 to clear the signature after generating the document
const handleGenerateConsent2 = async (data: any) => {
  if (!selectedVisit.value) {
    return;
  }

  if (!signature.value && !selectedVisit.value.secondaryConsent) {
    signatureOpen.value = true;
    return;
  }

  const docUrl = "https://wow-telecom.com/docx";
  const response = await axios.post(
    docUrl,
    {
      pet: selectedVisit.value.petName,
      race: selectedVisit.value.race,
      color: selectedVisit.value.color,
      owner: selectedVisit.value.ownerName,
      address: "",
      phoneNumber: selectedVisit.value.phoneNumber,
      signature: signature.value,
      sexo: data.sexo,
      vacuna: data.vacuna,
      edad: data.edad,
      desparasitacion: data.desparasitacion,
      tipoCorte: data.tipoCorte,
      observacionesCliente: data.observacionesCliente,
      observacionesVet: data.observacionesVeterinaria,
    },
    {
      responseType: "blob",
      headers: {
        tenantId: "CH0002",
        template: "concentimiento_peluqueria_template_2.docx",
      },
    },
  );

  const fileBlob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const documentUrl = await saveDocument(
    selectedVisit.value,
    fileBlob,
    userStore.userData!.uid!,
  );
  await setSecondaryConsent(selectedVisit.value.id, {
    ...data,
    documentUrl,
  });
  secondConcentFormOpen.value = false;

  $q.notify({
    type: "positive",
    message: "Documento guardado con éxito.",
    timeout: 2000,
  });
  window.open(documentUrl, "_blank");
  signature.value = null; // Clear the signature after generating the document
  refetch();
};

async function onSendWhatsapp() {
  if (!selectedVisit.value) {
    return;
  }

  const visit = selectedVisit.value;
  const tenantId = userStore.userData!.tenantId!;
  const tenantName =
    tenantId === "CH0001" ? "CANHIJOS" : "PURO AMOR ARTE CANINO";

  const message =
    tenantId === "CH0001"
      ? `> Hola, ${visit.ownerName}.\n> Le escribimos de la peluquería canina *${tenantName}* para notificarle que su mascota ya está lista, puede pasar a recogerlo. Saludos`
      : `> Hola, ${visit.ownerName}.\nLe escribimos de la estética canina *${tenantName}* ☺ 🐾 su mascotita estará lista en 15 min, puede pasar a recogerla. ¡Saludos!`;

  const encodedMessage = encodeURIComponent(message);

  const url = `https://wa.me/+591${visit.phoneNumber}?text=${encodedMessage}`;

  window.open(url, "_blank");
}

const formStore = useFormStore();
const handleEdit = (visit: Visit) => {
  formStore.setForm(visit);
  formStore.setMode("edit");
  modalOpen.value = true;
};
</script>

<template>
  <q-page class="full-height" padding>
    <div v-if="showError" class="text-center q-py-xl text-negative">
      <q-icon name="error" size="4rem" class="q-mb-md"></q-icon>
      <div>
        Ocurrió un error al cargar las visitas. Por favor, intente nuevamente.
      </div>
    </div>

    <div v-else class="full-height flex column" style="flex-wrap: nowrap">
      <StatCards v-model="data" />
      <Actions @create="modalOpen = true" @dateRange="handleChangeRange" />
      <CalendarStrip
        :selectedDate="calendarStore.selectedDate"
        @update:selectedDate="calendarStore.selectedDate = $event"
        :days="calendarStore.days"
      />
      <div style="flex-grow: 1; max-height: 100%; overflow-y: auto">
        <AppointmentList
          :appointments="data"
          :showLoading="showLoading"
          @edit="handleEdit"
          @delete="handleDelete"
          @generate-consent="handleOpenPrimaryConsentForm"
          @generate-consent2="handleOpenSecondaryConsentForm"
          @rate="handleRate"
          @showDetail="handleDetail"
        />
      </div>
    </div>
    <VisitFormDialog
      v-model="modalOpen"
      @submit="handleSubmit"
      @close="formStore.resetForm"
    />
  </q-page>
  <q-dialog v-model="detailOpen" :position="isMobile ? 'bottom' : 'standard'">
    <q-card style="width: 100%; max-height: 80vh; overflow-y: auto">
      <q-card-actions align="left">
        <q-btn flat color="primary" v-close-popup icon="arrow_back" round />
        <div>Detalle de la visita</div>
      </q-card-actions>
      <q-card-section>
        <div class="full-width flex justify-center">
          <q-btn-group>
            <q-btn
              :outline="selectedVisitForDialog.state !== 'PENDIENTE'"
              :dense="isMobile"
              color="primary"
              label="Pendiente"
              icon="hourglass_empty"
              @click="handleChangeState(selectedVisitForDialog.id, 'PENDIENTE')"
            />
            <q-btn
              :outline="selectedVisitForDialog.state !== 'COMPLETADO'"
              :dense="isMobile"
              color="green"
              label="Completado"
              icon="check_circle"
              @click="
                handleChangeState(selectedVisitForDialog.id, 'COMPLETADO')
              "
            />
            <q-btn
              :outline="selectedVisitForDialog.state !== 'CANCELADO'"
              :dense="isMobile"
              color="negative"
              icon="cancel"
              label="Cancelado"
              @click="handleChangeState(selectedVisitForDialog.id, 'CANCELADO')"
            />
          </q-btn-group>
        </div>
        <div class="q-mt-md">
          <q-expansion-item label="Detalles">
            <div class="q-px-sm">
              <div class="row">
                <div class="text-bold">Precio</div>
                <q-space />
                <div>{{ selectedVisitForDialog.price }}</div>
              </div>
              <div class="row">
                <div class="text-bold">A/C</div>
                <q-space />
                <div>
                  {{ selectedVisitForDialog.ac }}
                </div>
              </div>
              <div class="row">
                <div class="text-bold">Saldo</div>
                <q-space />
                <div>
                  {{ selectedVisitForDialog.balance }}
                </div>
              </div>
              <div class="row">
                <div class="text-bold">Color</div>
                <q-space />
                <div>{{ selectedVisitForDialog.color }}</div>
              </div>
              <div class="row">
                <div class="text-bold">Tipo decorte</div>
                <q-space />
                <div>{{ selectedVisitForDialog.cutType }}</div>
              </div>
            </div>
          </q-expansion-item>
          <q-expansion-item>
            <template #header>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ selectedVisitForDialog.petName?.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ selectedVisitForDialog.petName }}
                </q-item-label>
                <q-item-label caption>{{
                  selectedVisitForDialog.date
                }}</q-item-label>
              </q-item-section>
            </template>
            <q-item>
              <q-item-section avatar>
                <q-avatar
                  icon="mdi-whatsapp"
                  color="positive"
                  text-color="white"
                >
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label
                  >Dueño(a):
                  {{ selectedVisitForDialog.ownerName }}</q-item-label
                >
                <q-item-label caption>{{
                  selectedVisitForDialog.phoneNumber
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  icon="mdi-whatsapp"
                  @click="onSendWhatsapp"
                  target="_blank"
                >
                  <q-tooltip>Enviar WhatsApp</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-avatar icon="shower" color="blue-8" text-color="white">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Baño</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  :modelValue="selectedVisitForDialog.bathed"
                  @update:model-value="handleUpdateService('bathed')"
                ></q-checkbox>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-avatar icon="content_cut" color="brown" text-color="white">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Corte</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  :modelValue="selectedVisitForDialog.brushed"
                  @update:model-value="handleUpdateService('brushed')"
                ></q-checkbox>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-avatar icon="brush" color="teal" text-color="white">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Cepillado</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  :modelValue="selectedVisitForDialog.choped"
                  @update:model-value="handleUpdateService('choped')"
                ></q-checkbox>
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item>
            <template #header>
              <q-item-section avatar>
                <q-avatar icon="money" color="positive" text-color="white">
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Cobranzas</q-item-label>
              </q-item-section>
            </template>
            <q-item
              v-for="payment in selectedVisitForDialog.payments"
              :key="payment.uid"
            >
              <q-item-section avatar>
                <AvatarUser :userId="payment.userUid" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ payment.date }}</q-item-label>
                <q-item-label caption
                  >Monto: {{ payment.amount }}Bs.</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-icon
                  name="money"
                  color="green"
                  v-if="payment.method === 'EFECTIVO'"
                />
                <q-icon
                  name="qr_code"
                  color="blue"
                  v-else-if="payment.method === 'QR'"
                />
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="primaryConcentFormOpen">
    <div class="bg-white">
      <PrimaryConsentForm
        @submit="handleGenerateConsent"
        :isSignatureProvided="isSignatureProvided"
        @open-signature="signatureOpen = true"
      />
    </div>
  </q-dialog>
  <q-dialog v-model="secondConcentFormOpen">
    <div class="bg-white">
      <SecondConsentForm
        @submit="handleGenerateConsent2"
        :isSignatureProvided="isSignatureProvided"
        @open-signature="signatureOpen = true"
      />
    </div>
  </q-dialog>
  <q-dialog v-model="signatureOpen">
    <div class="bg-white">
      <Signature
        @save-signature="(v) => ((signature = v), (signatureOpen = false))"
      />
    </div>
  </q-dialog>
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
