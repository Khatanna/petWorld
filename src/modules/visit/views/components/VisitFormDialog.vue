<script lang="ts" setup>
import moment from "moment";
import { computed, ref } from "vue";
import type { PaymentFB } from "../../domain/visit.model";
import { useFormStore } from "../../ui/store/useFormStore";
import PaymentForm from "./PaymentForm.vue";

const formStore = useFormStore();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: any): void;
  (e: "close"): void;
}>();

const showPaymentDialog = ref(false);
const editingPaymentIndex = ref<number | null>(null);

const prePayment = computed(() => {
  return formStore.form.payments.reduce((total: number, payment: PaymentFB) => {
    return total + payment.amount;
  }, 0);
});

const remainingBalance = computed(() => {
  return formStore.form.price - prePayment.value;
});

const modelValue = defineModel<boolean>();

const openPaymentDialog = (index: number | null = null) => {
  if (index !== null) {
    editingPaymentIndex.value = index;
  } else {
    editingPaymentIndex.value = null;
  }
  showPaymentDialog.value = true;
};

const savePayment = (payment: PaymentFB) => {
  formStore.addPayment(payment);
  showPaymentDialog.value = false;
};

const formatDate = (date: Date | string) => {
  return moment(date).format("DD/MM/YYYY");
};

const getMethodLabel = (method: string) => {
  return method === "cash" ? "Efectivo" : "QR";
};

const getTypeLabel = (type: string) => {
  return type === "advance" ? "Anticipo" : "Saldo";
};
</script>

<template>
  <q-dialog
    v-model="modelValue"
    @hide="emit('close')"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 900px; max-width: 90vw" class="rounded-borders">
      <q-card-section
        class="row items-center justify-between q-px-lg q-py-md bg-grey-1 border-bottom"
      >
        <div>
          <div class="text-h6 text-weight-bold text-grey-9">
            {{ formStore.mode === "edit" ? "Editar Visita" : "Nueva Visita" }}
          </div>
          <div class="text-caption text-grey-6">
            Complete los detalles de la mascota y el servicio.
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="emit('update:modelValue', false)"
          color="grey-6"
        ></q-btn>
      </q-card-section>

      <q-separator></q-separator>

      <q-card-section class="q-pa-lg scroll" style="max-height: 70vh">
        <q-form class="q-gutter-y-lg">
          <div>
            <div
              class="text-subtitle2 text-primary text-uppercase text-weight-bold q-mb-md flex items-center"
            >
              <q-icon name="pets" class="q-mr-sm"></q-icon> Información de la
              Mascota
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.petName"
                  label="Nombre de la mascota"
                >
                  <template v-slot:prepend
                    ><q-icon name="pets" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.race"
                  label="Raza"
                >
                  <template v-slot:prepend
                    ><q-icon name="category" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.color"
                  label="Color"
                >
                  <template v-slot:prepend
                    ><q-icon name="palette" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.cutType"
                  label="Corte / Servicio"
                >
                  <template v-slot:prepend
                    ><q-icon name="content_cut" color="grey-5"
                  /></template>
                </q-input>
              </div>
            </div>
          </div>

          <q-separator></q-separator>

          <div>
            <div
              class="text-subtitle2 text-primary text-uppercase text-weight-bold q-mb-md flex items-center"
            >
              <q-icon name="person" class="q-mr-sm"></q-icon> Datos del Dueño
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.ownerName"
                  label="Nombre del dueño"
                >
                  <template v-slot:prepend
                    ><q-icon name="person" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.phoneNumber"
                  label="Número de contacto"
                  mask="########"
                >
                  <template v-slot:prepend
                    ><q-icon name="phone" color="grey-5"
                  /></template>
                </q-input>
              </div>
            </div>
          </div>

          <q-separator></q-separator>

          <div>
            <div
              class="text-subtitle2 text-primary text-uppercase text-weight-bold q-mb-md flex items-center"
            >
              <q-icon name="receipt_long" class="q-mr-sm"></q-icon> Detalles del
              Servicio
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.price"
                  label="Costo Total"
                  prefix="$"
                  type="number"
                >
                  <template v-slot:prepend
                    ><q-icon name="attach_money" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  outlined
                  dense
                  readonly
                  :model-value="prePayment"
                  label="A Cuenta / Anticipo"
                  prefix="$"
                  type="number"
                >
                  <template v-slot:prepend
                    ><q-icon name="payments" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-4 flex items-center">
                <div class="text-grey-7">
                  Saldo Pendiente:
                  <span class="text-h6 text-weight-bold text-grey-9 q-ml-sm"
                    >$ {{ remainingBalance }}</span
                  >
                </div>
              </div>
            </div>
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="formStore.form.hourOfDelivery"
                  label="Hora de Entrega"
                  readonly
                >
                  <template v-slot:prepend>
                    <q-icon name="schedule" color="grey-5" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time
                          v-model="formStore.form.hourOfDelivery"
                          mask="HH:mm"
                          format24h
                        >
                          <div class="row items-center justify-end">
                            <q-btn
                              v-close-popup
                              label="Cerrar"
                              color="primary"
                              flat
                            />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <q-separator></q-separator>

          <div>
            <div
              class="text-subtitle2 text-primary text-uppercase text-weight-bold q-mb-md flex items-center justify-between"
            >
              <div class="flex items-center">
                <q-icon name="payments" class="q-mr-sm"></q-icon> Pagos
              </div>
              <q-btn
                dense
                unelevated
                color="primary"
                icon="add"
                label="Agregar Pago"
                size="sm"
                @click="openPaymentDialog()"
              ></q-btn>
            </div>

            <div
              v-if="formStore.form.payments.length === 0"
              class="text-center text-grey-6 q-py-md"
            >
              <q-icon
                name="account_balance_wallet"
                size="48px"
                color="grey-4"
              ></q-icon>
              <div class="q-mt-sm">No hay pagos registrados</div>
            </div>

            <q-list v-else bordered separator class="rounded-borders">
              <q-item
                v-for="(payment, index) in formStore.form.payments"
                :key="index"
              >
                <q-item-section avatar>
                  <q-avatar
                    :color="payment.method === 'EFECTIVO' ? 'green' : 'blue'"
                    text-color="white"
                    icon="payment"
                  ></q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium"
                    >$ {{ payment.amount }}</q-item-label
                  >
                  <q-item-label caption>
                    {{ getMethodLabel(payment.method) }} •
                    {{ getTypeLabel(payment.type) }} •
                    {{ formatDate(payment.date) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-btn
                      flat
                      dense
                      round
                      color="primary"
                      icon="edit"
                      size="sm"
                      @click="openPaymentDialog(index)"
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      color="negative"
                      icon="delete"
                      size="sm"
                      @click="formStore.removePayment(index)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div>
            <div class="text-caption text-grey-8 q-mb-xs font-weight-medium">
              Observaciones
            </div>
            <q-input
              outlined
              v-model="formStore.form.observation"
              type="textarea"
              rows="3"
              placeholder="Alergias, comportamiento, notas especiales..."
            ></q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-separator></q-separator>

      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          @click="emit('update:modelValue', false)"
          class="q-px-md"
        ></q-btn>
        <q-btn
          unelevated
          :label="
            formStore.mode === 'edit' ? 'Guardar Cambios' : 'Registrar Visita'
          "
          color="primary"
          icon="check_circle"
          class="q-px-md"
          @click="emit('submit', formStore.form)"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <payment-form
    v-model:showPaymentDialog="showPaymentDialog"
    v-model:editing-payment-index="editingPaymentIndex"
    @save-payment="savePayment"
  />
</template>
