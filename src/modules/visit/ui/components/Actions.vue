<script lang="ts" setup>
import moment from "moment";
import { ref } from "vue";

// const states: string[] = ["TODO", "COMPLETADO", "PENDIENTE", "CANCELADO"];
// const selectedState = ref(states[0]);
const rangeDate = ref<
  | {
      from: string;
      to: string;
    }
  | string
  | null
>(moment().format("DD/MM/YYYY"));

const dateOptions = (date: string): boolean => {
  return moment(date).isBefore(moment());
};

const emit = defineEmits<{
  (e: "filter", state: string): void;
  (e: "create"): void;
  (e: "dateRange", range: { from: string; to: string } | null | string): void;
}>();
</script>

<template>
  <div class="row q-mb-sm items-center">
    <!-- <q-btn-dropdown
      color="primary"
      label="Filtrar por estado"
      no-caps
      class="q-mr-sm"
      split
      @click="selectedState && emit('filter', selectedState)"
    >
      <q-list>
        <q-item
          v-for="state in states"
          :key="state"
          clickable
          @click="
            selectedState = state;
            $emit('filter', state);
          "
        >
          <q-item-section>{{ state }}</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown> -->
    <q-space />
    <div>
      <q-btn
        color="primary"
        no-caps
        label="Registrar Visita"
        @click="$emit('create')"
        icon="add"
        padding="xs md"
      />
      <q-btn icon="event" padding="xs" class="q-ml-sm" no-caps color="primary">
        <q-popup-proxy transition-show="scale" transition-hide="scale">
          <q-date
            v-model="rangeDate"
            range
            today-btn
            mask="DD/MM/YYYY"
            :options="dateOptions"
          >
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn label="Cancelar" color="primary" flat v-close-popup />
              <q-btn
                label="Buscar"
                color="primary"
                flat
                @click="emit('dateRange', rangeDate)"
                v-close-popup
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-btn>
    </div>
  </div>
</template>
