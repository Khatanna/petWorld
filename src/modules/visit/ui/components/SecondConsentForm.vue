<script setup lang="ts">
import { ref } from "vue";

/* =======================
   Emits
======================= */
const emit = defineEmits<{
  (e: "submit", payload: SecondConsentFormData): void;
}>();

/* =======================
   State
======================= */
const sexo = ref<string | null>(null);
const vacuna = ref<string | null>(null);
const desparasitacion = ref<string | null>(null);

const edad = ref<string>("");
const tipoCorte = ref<string>("");
const observacionesCliente = ref<string>("");
const observacionesVeterinaria = ref<string>("");

/* =======================
   Options
======================= */
const sexoOptions = [
  { label: "Macho", value: "Macho" },
  { label: "Hembra", value: "Hembra" },
];

const yesNoOptions = [
  { label: "Sí", value: "Si" },
  { label: "No", value: "No" },
];

/* =======================
   Types
======================= */
interface SecondConsentFormData {
  sexo: string | null;
  vacuna: string | null;
  edad: string;
  desparasitacion: string | null;
  tipoCorte: string;
  observacionesCliente: string;
  observacionesVeterinaria: string;
}

/* =======================
   Submit
======================= */
const submitForm = () => {
  const formData: SecondConsentFormData = {
    sexo: sexo.value,
    vacuna: vacuna.value,
    edad: edad.value,
    desparasitacion: desparasitacion.value,
    tipoCorte: tipoCorte.value,
    observacionesCliente: observacionesCliente.value,
    observacionesVeterinaria: observacionesVeterinaria.value,
  };

  emit("submit", formData);
};
</script>

<template>
  <q-page padding>
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Formulario de Consentimiento</q-toolbar-title>
    </q-toolbar>

    <!-- Sexo -->
    <div class="q-mt-md">
      <div class="text-bold">Sexo</div>
      <q-option-group
        v-model="sexo"
        type="radio"
        :options="sexoOptions"
        inline
      />
    </div>

    <!-- Vacuna -->
    <div class="q-mt-md">
      <div class="text-bold">Vacuna</div>
      <q-option-group
        v-model="vacuna"
        type="radio"
        :options="yesNoOptions"
        inline
      />
    </div>

    <!-- Edad -->
    <div class="q-mt-md">
      <q-input v-model="edad" label="Edad" outlined />
    </div>

    <!-- Desparasitación -->
    <div class="q-mt-md">
      <div class="text-bold">Desparasitación</div>
      <q-option-group
        v-model="desparasitacion"
        type="radio"
        :options="yesNoOptions"
        inline
      />
    </div>

    <!-- Tipo de Corte -->
    <div class="q-mt-md">
      <q-input v-model="tipoCorte" label="Tipo de Corte" outlined />
    </div>

    <!-- Observaciones Cliente -->
    <div class="q-mt-md">
      <q-input
        v-model="observacionesCliente"
        label="Observaciones del Cliente"
        type="textarea"
        outlined
      />
    </div>

    <!-- Observaciones Veterinaria -->
    <div class="q-mt-md">
      <q-input
        v-model="observacionesVeterinaria"
        label="Observaciones de la Veterinaria"
        type="textarea"
        outlined
      />
    </div>

    <!-- Enviar -->
    <div class="q-mt-lg">
      <q-btn label="Enviar" color="primary" @click="submitForm" />
    </div>
  </q-page>
</template>
