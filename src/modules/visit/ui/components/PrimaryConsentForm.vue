<script lang="ts" setup>
import { getCssVar } from "quasar";
import { computed, reactive } from "vue";

interface FormField {
  key: string;
  label: string;
  type: "radio" | "checkbox" | "textarea" | "checkbox-group";
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  required?: boolean;
  icon?: string;
  hint?: string;
}

interface Props {
  fields?: FormField[];
  title?: string;
  submitLabel?: string;
  loading?: boolean;
  isSignatureProvided?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Formulario de Consentimiento",
  submitLabel: "Enviar",
  loading: false,
  fields: () => [
    {
      key: "size",
      label: "Tamaño",
      type: "radio",
      icon: "pets",
      required: true,
      options: ["XS", "S", "M", "L", "XL", "XXL"].map((v) => ({
        label: v,
        value: v,
      })),
    },
    {
      key: "observation",
      label: "Observaciones",
      type: "textarea",
      icon: "notes",
      placeholder: "Detalles importantes...",
    },
    {
      key: "details",
      label: "Detalles",
      type: "checkbox-group",
      icon: "checklist",
      options: [
        { label: "Pulgas", value: "Pulgas" },
        { label: "Garrapatas", value: "Garrapatas" },
        { label: "Otros", value: "Otros" },
      ],
    },
    {
      key: "antecedentes",
      label: "Antecedentes",
      type: "checkbox-group",
      icon: "psychology",
      options: [
        { label: "Ansiedad", value: "Ansiedad" },
        { label: "Agresividad", value: "Agresividad" },
        { label: "Asustadizo", value: "Asustadizo" },
      ],
    },
    {
      key: "behavior",
      label: "Comportamiento",
      type: "radio",
      icon: "sentiment_satisfied",
      required: true,
      options: ["Excelente", "Bueno", "Regular", "Malo"].map((v) => ({
        label: v,
        value: v,
      })),
    },
    {
      key: "ownerAuthorization",
      label: "Autorización del propietario",
      type: "radio",
      icon: "verified_user",
      required: true,
      options: [
        { label: "Sí", value: "Sí" },
        { label: "No", value: "No" },
      ],
    },
    {
      key: "serviceType",
      label: "Tipo de servicio",
      type: "radio",
      icon: "spa",
      required: true,
      options: ["Baño", "Mantención", "Servicio completo"].map((v) => ({
        label: v,
        value: v,
      })),
    },
  ],
});

const emit = defineEmits<{
  (e: "submit", payload: any): void;
  (e: "open-signature"): void;
}>();

const primaryColor = getCssVar("primary") || "#1976d2";

const formData = reactive<Record<string, any>>({});

props.fields.forEach((field) => {
  if (field.type === "checkbox-group") {
    formData[field.key] = reactive({});
    field.options?.forEach((opt) => {
      formData[field.key][opt.value] = false;
    });
  } else {
    formData[field.key] = null;
  }
});

const isFormValid = computed(() => {
  return props.fields
    .filter((f) => f.required)
    .every((f) => {
      const value = formData[f.key];
      return value !== null && value !== undefined && value !== "";
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
      <h2 class="form-title">{{ title }}</h2>
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

          <!-- Textarea compacto -->
          <q-input
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            type="textarea"
            outlined
            dense
            :placeholder="field.placeholder"
            rows="2"
            maxlength="300"
          />

          <!-- Checkbox group inline -->
          <div
            v-else-if="field.type === 'checkbox-group'"
            class="checkbox-inline"
          >
            <q-checkbox
              v-for="option in field.options"
              :key="option.value"
              v-model="formData[field.key][option.value]"
              :label="option.label"
              color="primary"
              dense
            />
          </div>
        </div>
      </div>

      <div class="form-footer">
        <q-btn
          type="submit"
          :label="submitLabel"
          color="primary"
          unelevated
          :disable="!isFormValid || loading"
          :loading="loading"
          class="q-mr-sm"
          icon-right="send"
          no-caps
        />

        <q-btn
          label="Firmar"
          color="primary"
          unelevated
          @click="emit('open-signature')"
          icon-right="create"
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

.checkbox-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.form-footer {
  text-align: center;
}

/* Mobile optimizations */
@media (max-width: 600px) {
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

  .checkbox-inline {
    flex-direction: column;
    gap: 8px;
  }
}

/* Landscape mobile */
@media (max-width: 900px) and (orientation: landscape) {
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
