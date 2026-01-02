<script setup lang="ts">
import { ref, onMounted } from "vue";
import SignaturePad from "signature_pad";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let signaturePad: SignaturePad | null = null;

onMounted(() => {
  if (!canvasRef.value) return;

  signaturePad = new SignaturePad(canvasRef.value, {
    backgroundColor: "white",
  });

  resizeCanvas();
});

const resizeCanvas = () => {
  if (!canvasRef.value || !signaturePad) return;

  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvasRef.value.width = canvasRef.value.offsetWidth * ratio;
  canvasRef.value.height = 200 * ratio;
  canvasRef.value.getContext("2d")?.scale(ratio, ratio);
  signaturePad.clear();
};

const clear = () => {
  signaturePad?.clear();
};

const save = () => {
  if (!signaturePad || signaturePad.isEmpty()) return;

  const base64 = signaturePad.toDataURL();
  emit("save-signature", base64); // Emit the signature
};

const emit = defineEmits<{
  (e: "save-signature", dataUrl: string): void;
}>();
</script>

<template>
  <q-card>
    <q-card-section>
      <div class="text-bold q-mb-sm">Firma del cliente</div>

      <canvas ref="canvasRef" class="signature-canvas" />

      <div class="q-mt-sm row q-gutter-sm">
        <q-btn label="Limpiar" color="negative" flat @click="clear" />
        <q-btn label="Guardar" color="primary" @click="save" />
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.signature-canvas {
  width: 100%;
  height: 200px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
