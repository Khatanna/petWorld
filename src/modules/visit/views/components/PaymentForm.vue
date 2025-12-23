<script lang="ts" setup>
import { ref } from "vue";
import type { PaymentFB } from "../../domain/visit.model";
import moment from "moment";

const showPaymentDialog = defineModel<boolean>("showPaymentDialog", {
  required: true,
});
const editingPaymentIndex = defineModel<number | null>("editingPaymentIndex", {
  required: false,
  default: null,
});
const paymentForm = ref<PaymentFB>({
  amount: 0,
  date: moment().format("YYYY-MM-DD"),
  method: "EFECTIVO",
  type: "ANTICIPO",
  userUid: "",
});

const resetPaymentForm = () => {
  paymentForm.value = {
    amount: 0,
    date: moment().format("YYYY-MM-DD"),
    method: "EFECTIVO",
    type: "ANTICIPO",
    userUid: "",
  };
};

const emit = defineEmits<{
  (e: "savePayment", payment: PaymentFB): void;
}>();
</script>

<template>
  <q-dialog v-model="showPaymentDialog" @hide="resetPaymentForm">
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
          @click="emit('savePayment', paymentForm)"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
