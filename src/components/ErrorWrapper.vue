<template>
  <div>
    <template v-if="hasError">
      <div class="q-pa-md text-center">
        <h2>An error occurred</h2>
        <p>{{ errorMessage }}</p>
        <q-btn label="Reload" color="primary" @click="reloadPage" />
      </div>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const hasError = ref<boolean>(false);
const errorMessage = ref<string>("");

function reloadPage(): void {
  window.location.reload();
}

function setError(error: Error): void {
  hasError.value = true;
  errorMessage.value = error.message || "Unknown error occurred.";
}

defineExpose({ setError });
</script>
