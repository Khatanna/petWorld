<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import moment from "moment";
import type { Payment, VisitCreate } from "../../domain/visit.model";

const form = reactive<VisitCreate>({
  petName: "Test",
  color: "Test",
  ownerName: "Test",
  cutType: "Test",
  phoneNumber: "Test",
  price: 0,
  date: new Date().toISOString(),
  createdByUid: "1",
  dateModified: new Date().toISOString(),
  payments: [],
  race: "Test",
  state: "PENDIENTE",
  feedback: "Test",
  hourOfDelivery: "",
  observation: "Test",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", form: any): void;
}>();

const payments = ref<Payment[]>([]);
const showPaymentDialog = ref(false);
const editingPaymentIndex = ref<number | null>(null);

const paymentForm = reactive<Omit<Payment, "uid">>({
  userUid: "1",
  method: "cash",
  amount: 0,
  date: moment().format("DD-MM-YYYY"),
  type: "advance",
});

const prePayment = computed(() => {
  return payments.value.reduce((total: number, payment: Payment) => {
    return total + payment.amount;
  }, 0);
});

const remainingBalance = computed(() => {
  return form.price - prePayment.value;
});

const modelValue = defineModel<boolean>();

const openPaymentDialog = (index: number | null = null) => {
  if (index !== null) {
    editingPaymentIndex.value = index;
    const payment = payments.value[index];
    if (!payment) return;
    paymentForm.userUid = payment.userUid;
    paymentForm.method = payment.method;
    paymentForm.amount = payment.amount;
    paymentForm.date = moment(payment.date).format("DD-MM-YYYY");
    paymentForm.type = payment.type;
  } else {
    // Nuevo pago
    editingPaymentIndex.value = null;
    paymentForm.userUid = "1";
    paymentForm.method = "cash";
    paymentForm.amount = 0;
    paymentForm.date = moment().format("DD-MM-YYYY");
    paymentForm.type = "advance";
  }
  showPaymentDialog.value = true;
};

const savePayment = () => {
  if (paymentForm.amount <= 0) {
    return;
  }

  if (editingPaymentIndex.value !== null) {
    const payment = payments.value[editingPaymentIndex.value];
    if (!payment) return;
    payment.method = paymentForm.method;
    payment.amount = paymentForm.amount;
    payment.date = paymentForm.date;
    payment.type = paymentForm.type;
  } else {
    // Crear nuevo pago
    const newPayment: Payment = {
      uid: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      ...paymentForm,
    };
    payments.value.push(newPayment);
  }

  // Actualizar los pagos en el formulario
  form.payments = [...payments.value];

  showPaymentDialog.value = false;
};

const deletePayment = (index: number) => {
  payments.value.splice(index, 1);
  form.payments = [...payments.value];
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
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="width: 900px; max-width: 90vw" class="rounded-borders">
      <q-card-section
        class="row items-center justify-between q-px-lg q-py-md bg-grey-1 border-bottom"
      >
        <div>
          <div class="text-h6 text-weight-bold text-grey-9">
            Registrar Nueva Visita
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
                  v-model="form.petName"
                  label="Nombre de la mascota"
                >
                  <template v-slot:prepend
                    ><q-icon name="pets" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input outlined dense v-model="form.race" label="Raza">
                  <template v-slot:prepend
                    ><q-icon name="category" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input outlined dense v-model="form.color" label="Color">
                  <template v-slot:prepend
                    ><q-icon name="palette" color="grey-5"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  outlined
                  dense
                  v-model="form.cutType"
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
                  v-model="form.ownerName"
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
                  v-model="form.phoneNumber"
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
                  v-model="form.price"
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
                  v-model="form.hourOfDelivery"
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
                          v-model="form.hourOfDelivery"
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

          <!-- Sección de Pagos -->
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
              v-if="payments.length === 0"
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
              <q-item v-for="(payment, index) in payments" :key="payment.uid">
                <q-item-section avatar>
                  <q-avatar
                    :color="payment.method === 'cash' ? 'green' : 'blue'"
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
                      @click="deletePayment(index)"
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
              v-model="form.observation"
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
          label="Registrar Visita"
          color="primary"
          icon="check_circle"
          class="q-px-md"
          @click="emit('submit', form)"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog para gestionar pagos -->
  <q-dialog v-model="showPaymentDialog">
    <q-card style="width: 500px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ editingPaymentIndex !== null ? "Editar Pago" : "Nuevo Pago" }}
        </div>
        <q-space></q-space>
        <q-btn icon="close" flat round dense v-close-popup></q-btn>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md">
          <q-input
            outlined
            v-model.number="paymentForm.amount"
            label="Monto"
            prefix="$"
            type="number"
            :rules="[(val) => val > 0 || 'El monto debe ser mayor a 0']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" color="grey-5"></q-icon>
            </template>
          </q-input>

          <q-select
            outlined
            v-model="paymentForm.method"
            :options="[
              { label: 'Efectivo', value: 'cash' },
              { label: 'QR', value: 'qr' },
            ]"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            label="Método de Pago"
          >
            <template v-slot:prepend>
              <q-icon name="payment" color="grey-5"></q-icon>
            </template>
          </q-select>

          <q-select
            outlined
            v-model="paymentForm.type"
            :options="[
              { label: 'Anticipo', value: 'advance' },
              { label: 'Saldo', value: 'balance' },
            ]"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            label="Tipo de Pago"
          >
            <template v-slot:prepend>
              <q-icon name="category" color="grey-5"></q-icon>
            </template>
          </q-select>

          <q-input outlined v-model="paymentForm.date" label="Fecha" readonly>
            <template v-slot:prepend>
              <q-icon name="event" color="grey-5"></q-icon>
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="paymentForm.date" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" v-close-popup></q-btn>
        <q-btn
          unelevated
          :label="editingPaymentIndex !== null ? 'Actualizar' : 'Agregar'"
          color="primary"
          @click="savePayment"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
