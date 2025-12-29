<script lang="ts" setup>
import { getCssVar } from "quasar";
import { ref, onMounted, onUnmounted } from "vue";
import moment from "moment";

const props = defineProps<{
  selectedDate: moment.Moment;
  days: Array<moment.Moment>;
}>();

const emit = defineEmits(["update:selectedDate"]);

const scrollContainer = ref<HTMLElement | null>(null);
const showLeftArrow = ref(false);
const showRightArrow = ref(false);

// Swipe/drag handling
let touchStartX = 0;
let touchEndX = 0;
let isMouseDown = false;
let isDragging = false;
let scrollLeft = 0;

const checkArrowsVisibility = () => {
  if (!scrollContainer.value) return;

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  showLeftArrow.value = scrollLeft > 0;
  showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 1;
};

const scrollToDirection = (direction: "left" | "right") => {
  if (!scrollContainer.value) return;

  const scrollAmount = 200;
  const targetScroll =
    direction === "left"
      ? scrollContainer.value.scrollLeft - scrollAmount
      : scrollContainer.value.scrollLeft + scrollAmount;

  scrollContainer.value.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  });
};

const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0]?.clientX ?? 0;
  touchEndX = touchStartX;
};

const handleTouchMove = (event: TouchEvent) => {
  touchEndX = event.touches[0]?.clientX ?? 0;
};

const handleTouchEnd = () => {
  handleSwipe();
};

const handleMouseDown = (event: MouseEvent) => {
  if (!scrollContainer.value) return;

  isMouseDown = true;
  isDragging = false;
  touchStartX = event.clientX;
  touchEndX = touchStartX;
  scrollLeft = scrollContainer.value.scrollLeft;

  event.preventDefault();
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isMouseDown || !scrollContainer.value) return;

  touchEndX = event.clientX;
  const deltaX = event.clientX - touchStartX;

  if (Math.abs(deltaX) > 5) {
    isDragging = true;
    scrollContainer.value.scrollLeft = scrollLeft - deltaX;
  }
};

const handleMouseUp = () => {
  if (isMouseDown) {
    isMouseDown = false;

    if (isDragging) {
      handleSwipe();
    }

    isDragging = false;
  }
};

const handleMouseLeave = () => {
  if (isMouseDown) {
    isMouseDown = false;
    isDragging = false;
  }
};

const handleSwipe = () => {
  const swipeDistance = touchEndX - touchStartX;

  if (swipeDistance > 50) {
    const currentIndex = props.days.findIndex((day) =>
      day.isSame(props.selectedDate, "day"),
    );
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      emit("update:selectedDate", props.days[prevIndex]);
    }
  } else if (swipeDistance < -50) {
    const currentIndex = props.days.findIndex((day) =>
      day.isSame(props.selectedDate, "day"),
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex < props.days.length) {
      emit("update:selectedDate", props.days[nextIndex]);
    }
  }
};

const handleDayClick = (date: moment.Moment) => {
  if (!isDragging) {
    emit("update:selectedDate", date);
  }
};

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("scroll", checkArrowsVisibility);
    checkArrowsVisibility();
  }
});

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("scroll", checkArrowsVisibility);
  }
});
</script>

<template>
  <div class="row items-center justify-between q-mb-sm relative-position">
    <!-- Flecha izquierda -->
    <transition name="fade">
      <q-btn
        v-show="showLeftArrow"
        round
        flat
        icon="chevron_left"
        color="primary"
        size="sm"
        class="arrow-btn arrow-left"
        @click="scrollToDirection('left')"
      />
    </transition>

    <!-- Contenedor de días -->
    <div
      ref="scrollContainer"
      class="row no-wrap scroll hide-scrollbar q-gutter-x-xs col-grow"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      style="user-select: none"
      :style="{ cursor: isMouseDown ? 'grabbing' : 'grab' }"
    >
      <div
        v-for="(date, index) in days"
        :key="index"
        @click="handleDayClick(date)"
        class="q-px-sm q-py-xs column items-center justify-center cursor-pointer rounded-borders calendar-strip-btn border"
        :class="
          selectedDate.startOf('d').diff(date.startOf('d'), 'day') === 0
            ? 'bg-primary text-white shadow-3 calendar-active'
            : 'bg-white text-grey-6'
        "
        style="min-width: 48px"
        :style="{
          border:
            selectedDate.startOf('d').diff(date.startOf('d'), 'day') === 0
              ? `1px solid ${getCssVar('primary')}`
              : '1px solid #e0e0e0',
        }"
      >
        <div style="font-size: 0.5rem">
          {{ date.format("MM") }}/{{ date.format("YY") }}
        </div>
        <div class="text-caption text-uppercase text-weight-bold">
          {{ date.format("ddd") }}
        </div>
        <div class="text-h6 text-weight-bold line-height-normal">
          {{ date.date() }}
        </div>
      </div>
    </div>

    <!-- Flecha derecha -->
    <transition name="fade">
      <q-btn
        v-show="showRightArrow"
        round
        flat
        icon="chevron_right"
        color="primary"
        size="sm"
        class="arrow-btn arrow-right"
        @click="scrollToDirection('right')"
      />
    </transition>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.arrow-btn {
  position: absolute;
  z-index: 10;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.arrow-left {
  left: -8px;
}

.arrow-right {
  right: -8px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
