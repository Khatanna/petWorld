<script lang="ts" setup>
import { ref } from "vue";
import type { PaymentCreate } from "../../domain/visit.model";

const showPaymentDialog = defineModel<boolean>("showPaymentDialog", {
  required: true,
});
const editingPaymentIndex = defineModel<number | null>("editingPaymentIndex", {
  required: false,
  default: null,
});
const paymentForm = ref<PaymentCreate>({
  amount: 0,
  method: "EFECTIVO",
  type: "A/C",
  userUid: "",
});

const resetPaymentForm = () => {
  paymentForm.value = {
    amount: 0,
    method: "EFECTIVO",
    type: "A/C",
    userUid: "",
  };
};

const emit = defineEmits<{
  (e: "savePayment", payment: PaymentCreate): void;
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
              { label: 'Anticipo', value: 'A/C' },
              { label: 'Saldo', value: 'Saldo' },
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
