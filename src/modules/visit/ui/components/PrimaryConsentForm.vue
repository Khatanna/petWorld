<script lang="ts" setup>
import { ref, reactive } from "vue";

const emit = defineEmits<{
  (e: "submit", payload: any): void;
}>();

const size = ref(null);
const behavior = ref(null);
const ownerAuthorization = ref(null);
const serviceType = ref(null);
const observation = ref("");

const details = reactive({
  Pulgas: false,
  Garrapatas: false,
  Otros: false,
});

const antecedentes = reactive({
  Ansiedad: false,
  Agresividad: false,
  Asustadizo: false,
});

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"].map((v) => ({
  label: v,
  value: v,
}));

const behaviorOptions = ["Excelente", "Regular", "Bueno", "Malo"].map((v) => ({
  label: v,
  value: v,
}));

const yesNoOptions = [
  { label: "Sí", value: "Sí" },
  { label: "No", value: "No" },
];

const serviceTypeOptions = ["Baño", "Mantención", "Servicio completo"].map(
  (v) => ({ label: v, value: v }),
);

const submitForm = () => {
  const formData = {
    size: size.value,
    observation: observation.value,
    details: { ...details },
    antecedentes: { ...antecedentes },
    behavior: behavior.value,
    ownerAuthorization: ownerAuthorization.value,
    serviceType: serviceType.value,
  };

  emit("submit", formData);
};
</script>

<template>
  <q-page padding>
    <q-toolbar class="bg-primary text-white">
      <q-toolbar-title>Formulario de Consentimiento</q-toolbar-title>
    </q-toolbar>

    <!-- Tamaño -->
    <div class="q-mt-md">
      <div class="text-bold">Tamaño</div>
      <q-option-group v-model="size" type="radio" :options="sizeOptions" />
    </div>

    <!-- Observación -->
    <div class="q-mt-md">
      <div class="text-bold">Observación</div>
      <q-input
        v-model="observation"
        type="textarea"
        outlined
        placeholder="Escribe tus observaciones aquí"
      />
    </div>

    <!-- Detalle -->
    <div class="q-mt-md">
      <div class="text-bold">Detalle</div>
      <q-checkbox
        v-for="(_value, key) in details"
        :key="key"
        v-model="details[key]"
        :label="key"
      />
    </div>

    <!-- Antecedentes -->
    <div class="q-mt-md">
      <div class="text-bold">Antecedentes</div>
      <q-checkbox
        v-for="(_value, key) in antecedentes"
        :key="key"
        v-model="antecedentes[key]"
        :label="key"
      />
    </div>

    <!-- Comportamiento -->
    <div class="q-mt-md">
      <div class="text-bold">Comportamiento</div>
      <q-option-group
        v-model="behavior"
        type="radio"
        :options="behaviorOptions"
      />
    </div>

    <!-- Autorización del dueño -->
    <div class="q-mt-md">
      <div class="text-bold">Autorización del dueño</div>
      <q-option-group
        v-model="ownerAuthorization"
        type="radio"
        :options="yesNoOptions"
      />
    </div>

    <!-- Tipo de servicio -->
    <div class="q-mt-md">
      <div class="text-bold">Tipo de servicio</div>
      <q-option-group
        v-model="serviceType"
        type="radio"
        :options="serviceTypeOptions"
      />
    </div>

    <!-- Enviar -->
    <div class="q-mt-lg">
      <q-btn label="Enviar" color="primary" @click="submitForm" />
    </div>
  </q-page>
</template>
