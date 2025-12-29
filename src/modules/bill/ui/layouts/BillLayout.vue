<script lang="ts" setup>
import { useUserStore } from "@/core/store/useUserStore";
import { BillRepository } from "../../infrastructure/bill.repository";
import { useQuery } from "@tanstack/vue-query";
import { useCalendarStore } from "@/core/store/useCalendarStore";
import CalendarStrip from "@/modules/visit/ui/components/CalendarStrip.vue";

const calendarStore = useCalendarStore();
const userStore = useUserStore();

const { getBills } = BillRepository(userStore.userData!.tenantId!);

const {
  data: bills,
  isLoading,
  error,
} = useQuery({
  queryKey: ["billList"],
  queryFn: async () => {
    return await getBills({
      date: {
        from: calendarStore.selectedDate,
        to: calendarStore.selectedDate,
      },
      userId: userStore.userData?.uid,
    });
  },
  initialData: [],
  refetchOnWindowFocus: false,
});
</script>

<template>
  <q-page class="full-height" padding>
    <div v-if="error">
      <q-banner type="negative" class="bg-red-2 text-red-10">
        <q-icon name="warning" class="q-mr-sm" />
        Ocurrió un error al cargar las facturas: {{ error.message }}
      </q-banner>
    </div>
    <div v-else class="full-height flex column" style="flex-wrap: nowrap">
      <CalendarStrip
        :selected-date="calendarStore.selectedDate"
        @update:selected-date="calendarStore.selectedDate = $event"
        :days="calendarStore.days"
      />
      <div
        v-if="isLoading"
        class="text-center q-py-xl full-height flex column items-center justify-center"
      >
        <q-spinner color="primary" size="4rem" class="q-mb-md"></q-spinner>
        <div>Cargando citas...</div>
      </div>
      <div
        v-if="bills.length === 0 && !isLoading"
        class="text-center q-py-xl text-grey-5 full-height flex column items-center justify-center"
      >
        <q-icon name="event_busy" size="4rem" class="q-mb-md"></q-icon>
        <div>No hay gastos registrados para este día</div>
      </div>
      <div style="flex-grow: 1; max-height: 100%; overflow-y: auto">
        <q-virtual-scroll :items="bills" class="q-my-sm" v-slot="{ item }">
          <q-item :key="item.id" class="my-card">
            <q-item-section>
              <div class="row items-center q-gutter-x-md no-wrap">
                <div class="text-subtitle1 text-weight-bold text-grey-9">
                  {{ item.concept }}
                </div>
                <q-space />
                <div class="text-subtitle2 text-weight-medium text-grey-7">
                  {{ item.date.clone().format("DD/MM/YYYY HH:mm") }}
                </div>
                <div class="text-subtitle1 text-weight-bold text-primary">
                  ${{ item.amount.toFixed(2) }}
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </div>
    </div>
  </q-page>
</template>
