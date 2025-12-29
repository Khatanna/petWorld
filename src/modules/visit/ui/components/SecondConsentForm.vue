<script lang="ts" setup>
import { ref, reactive, computed } from "vue";
import { getCssVar } from "quasar";

interface FormField {
  key: string;
  label: string;
  type: "radio" | "text" | "textarea";
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  required?: boolean;
  icon?: string;
  maxlength?: number;
}

interface Props {
  fields?: FormField[];
  title?: string;
  submitLabel?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Formulario de Consentimiento",
  submitLabel: "Enviar",
  loading: false,
  fields: () => [
    {
      key: "sexo",
      label: "Sexo",
      type: "radio",
      icon: "transgender",
      required: true,
      options: [
        { label: "Macho", value: "Macho" },
        { label: "Hembra", value: "Hembra" },
      ],
    },
    {
      key: "edad",
      label: "Edad",
      type: "text",
      icon: "cake",
      placeholder: "Ej: 2 años, 6 meses",
      required: true,
    },
    {
      key: "vacuna",
      label: "Vacuna al día",
      type: "radio",
      icon: "vaccines",
      required: true,
      options: [
        { label: "Sí", value: "Si" },
        { label: "No", value: "No" },
      ],
    },
    {
      key: "desparasitacion",
      label: "Desparasitación",
      type: "radio",
      icon: "medication",
      required: true,
      options: [
        { label: "Sí", value: "Si" },
        { label: "No", value: "No" },
      ],
    },
    {
      key: "tipoCorte",
      label: "Tipo de Corte",
      type: "text",
      icon: "content_cut",
      placeholder: "Ej: Corte sanitario, estético...",
      required: true,
    },
    {
      key: "observacionesCliente",
      label: "Observaciones del Cliente",
      type: "textarea",
      icon: "person",
      placeholder: "Indicaciones especiales del propietario...",
      maxlength: 300,
    },
    {
      key: "observacionesVeterinaria",
      label: "Observaciones Veterinarias",
      type: "textarea",
      icon: "medical_services",
      placeholder: "Notas médicas o condiciones especiales...",
      maxlength: 300,
    },
  ],
});

const emit = defineEmits<{
  (e: "submit", payload: any): void;
}>();

// Obtener color primario de Quasar
const primaryColor = getCssVar("primary") || "#1976d2";

// Estado del formulario dinámico
const formData = reactive<Record<string, any>>({});

// Inicializar valores del formulario
props.fields.forEach((field) => {
  formData[field.key] =
    field.type === "textarea" || field.type === "text" ? "" : null;
});

// Validación básica
const isFormValid = computed(() => {
  return props.fields
    .filter((f) => f.required)
    .every((f) => {
      const value = formData[f.key];
      if (typeof value === "string") {
        return value.trim().length > 0;
      }
      return value !== null && value !== undefined;
    });
});

const submitForm = () => {
  if (!isFormValid.value) {
    return;
  }
  emit("submit", { ...formData });
};
</script>

<template>
  <div class="form-wrapper">
    <!-- Header compacto -->
    <div class="form-header" :style="{ background: primaryColor }">
      <q-icon name="assignment" size="28px" />
      <h1 class="form-title">{{ title }}</h1>
    </div>

    <!-- Formulario compacto -->
    <q-form @submit.prevent="submitForm" class="form-content">
      <div v-for="field in fields" :key="field.key" class="form-field">
        <!-- Label con icono -->
        <div class="field-label">
          <q-icon
            v-if="field.icon"
            :name="field.icon"
            size="18px"
            :color="primaryColor"
          />
          <span>
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
          </span>
        </div>

        <!-- Campo según tipo -->
        <div class="field-content">
          <!-- Radio buttons inline -->
          <q-option-group
            v-if="field.type === 'radio'"
            v-model="formData[field.key]"
            :options="field.options"
            color="primary"
            type="radio"
            inline
            dense
          />

          <!-- Input de texto -->
          <q-input
            v-else-if="field.type === 'text'"
            v-model="formData[field.key]"
            outlined
            dense
            :placeholder="field.placeholder"
          />

          <!-- Textarea compacto -->
          <q-input
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            type="textarea"
            outlined
            dense
            :placeholder="field.placeholder"
            rows="2"
            :maxlength="field.maxlength || 300"
          />
        </div>
      </div>

      <!-- Footer con botón -->
      <div class="form-footer">
        <q-btn
          type="submit"
          :label="submitLabel"
          color="primary"
          unelevated
          :disable="!isFormValid || loading"
          :loading="loading"
          class="submit-btn"
          icon-right="send"
          no-caps
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>
.form-wrapper {
  max-width: 700px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  color: white;
  padding: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.form-content {
  padding: 20px;
}

.form-field {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.form-field:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 10px;
}

.required {
  color: #f44336;
  font-weight: 700;
}

.field-content {
  padding-left: 26px;
}

.form-footer {
  text-align: center;
}

.submit-btn {
  min-width: 160px;
  padding: 8px 24px;
  font-weight: 500;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .form-container {
    padding: 8px;
  }

  .form-header {
    padding: 16px;
  }

  .form-title {
    font-size: 18px;
  }

  .form-content {
    padding: 16px;
  }

  .form-field {
    margin-bottom: 16px;
    padding-bottom: 16px;
  }

  .field-label {
    font-size: 13px;
  }

  .field-content {
    padding-left: 0;
  }
}

/* Landscape mobile */
@media (max-width: 900px) and (orientation: landscape) {
  .form-container {
    padding: 8px;
  }

  .form-header {
    padding: 12px;
  }

  .form-content {
    padding: 12px;
  }

  .form-field {
    margin-bottom: 12px;
    padding-bottom: 12px;
  }
}
</style>
