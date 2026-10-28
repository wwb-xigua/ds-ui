<script setup lang="ts" name="PdfViewer">
  /**
   * PDF reader.
   *
   * A generic component with no knowledge of the surrounding application: it
   * takes a PDF URL and renders it. That makes it a candidate for ds-ui rather
   * than for this app.
   */
  import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
  import { NAlert, NButton, NSpin } from 'naive-ui';
  import * as pdfjsLib from 'pdfjs-dist';
  import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const props = withDefaults(
    defineProps<{
      /** URL of the PDF to display. */
      src: string;
      /** Viewer height. `100%` fills the parent. */
      height?: string;
      /** Zoom step applied by the toolbar buttons. */
      zoomStep?: number;
    }>(),
    { height: '100%', zoomStep: 0.25 },
  );

  const emit = defineEmits<{
    (e: 'loaded', pageCount: number): void;
    (e: 'error', message: string): void;
  }>();

  const loading = ref(false);
  const errorMsg = ref('');
  const pageCount = ref(0);
  const currentPage = ref(1);
  const zoom = ref(1);
  const rotation = ref(0);
  const fitWidth = ref(true);

  const container = ref<HTMLElement | null>(null);
  const canvases = shallowRef<HTMLCanvasElement[]>([]);
  const doc = shallowRef<any>(null);
  const pageSizes = ref<{ width: number; height: number }[]>([]);

  let renderTask: any = null;
  let destroyed = false;

  const scale = computed(() => zoom.value);

  async function load() {
    if (!props.src) return;

    loading.value = true;
    errorMsg.value = '';
    currentPage.value = 1;
    zoom.value = 1;
    rotation.value = 0;

    try {
      const task = pdfjsLib.getDocument({ url: props.src, withCredentials: false });
      doc.value = await task.promise;

      if (destroyed) return;

      pageCount.value = doc.value.numPages;
      pageSizes.value = Array.from({ length: doc.value.numPages }, (_, i) => {
        const vp = doc.value.getPage(i + 1).then((p: any) => p.getViewport({ scale: 1 }));
        return { width: 0, height: 0, ...(vp as any) };
      }) as any;

      emit('loaded', pageCount.value);
      await renderAll();
    } catch (err: any) {
      if (destroyed) return;
      errorMsg.value = err?.message ?? 'PDF 加载失败';
      emit('error', errorMsg.value);
    } finally {
      if (!destroyed) loading.value = false;
    }
  }

  async function renderAll() {
    if (!doc.value) return;

    const dpr = window.devicePixelRatio || 1;
    const sizes: { width: number; height: number }[] = [];

    for (let i = 1; i <= pageCount.value; i += 1) {
      const page = await doc.value.getPage(i);
      const base = page.getViewport({ scale: scale.value, rotation: rotation.value });

      const available = container.value?.clientWidth ?? base.width;
      const cssWidth = fitWidth.value ? Math.min(base.width, available - 32) : base.width;
      const cssHeight = (base.height / base.width) * cssWidth;

      sizes.push({ width: cssWidth, height: cssHeight });

      const viewport = page.getViewport({
        scale: (cssWidth / base.width) * dpr,
        rotation: rotation.value,
      });

      const canvas = canvases.value[i - 1];
      if (!canvas) continue;

      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      renderTask?.cancel?.();
      renderTask = page.render({ canvasContext: context, viewport });
      try {
        await renderTask.promise;
      } catch {
        /* cancelled by a newer render */
      }
    }

    pageSizes.value = sizes;
  }

  function zoomIn() {
    zoom.value = Math.min(3, zoom.value + props.zoomStep);
    fitWidth.value = false;
    void renderAll();
  }

  function zoomOut() {
    zoom.value = Math.max(0.25, zoom.value - props.zoomStep);
    fitWidth.value = false;
    void renderAll();
  }

  function toggleFit() {
    fitWidth.value = !fitWidth.value;
    void renderAll();
  }

  function rotate() {
    rotation.value = (rotation.value + 90) % 360;
    void renderAll();
  }

  function goto(page: number) {
    currentPage.value = Math.min(Math.max(1, page), pageCount.value);
  }

  function onScroll() {
    const el = container.value;
    if (!el) return;

    const pages = el.querySelectorAll<HTMLElement>('.ds-pdf-page');
    const top = el.scrollTop + 24;
    for (let i = 0; i < pages.length; i += 1) {
      if (pages[i].offsetTop <= top) currentPage.value = i + 1;
    }
  }

  watch(() => props.src, load);

  onMounted(load);

  onBeforeUnmount(() => {
    destroyed = true;
    renderTask?.cancel?.();
    doc.value?.destroy?.();
  });
</script>

<template>
  <div class="ds-pdf">
    <div class="ds-pdf-toolbar">
      <div class="ds-pdf-group">
        <n-button
          size="small"
          quaternary
          :disabled="currentPage <= 1"
          @click="goto(currentPage - 1)"
        >
          上一页
        </n-button>
        <span class="ds-pdf-pager">{{ currentPage }} / {{ pageCount || '-' }}</span>
        <n-button
          size="small"
          quaternary
          :disabled="currentPage >= pageCount"
          @click="goto(currentPage + 1)"
        >
          下一页
        </n-button>
      </div>

      <div class="ds-pdf-group">
        <n-button size="small" quaternary @click="zoomOut">−</n-button>
        <span class="ds-pdf-pager">{{ Math.round(zoom * 100) }}%</span>
        <n-button size="small" quaternary @click="zoomIn">＋</n-button>
        <n-button
          size="small"
          quaternary
          :type="fitWidth ? 'primary' : 'default'"
          @click="toggleFit"
        >
          适应宽度
        </n-button>
        <n-button size="small" quaternary @click="rotate">旋转</n-button>
      </div>
    </div>

    <div ref="container" class="ds-pdf-body" :style="{ height }" @scroll="onScroll">
      <n-spin v-if="loading" class="ds-pdf-loading" size="large" />

      <n-alert v-if="errorMsg" type="error" :bordered="false" class="ds-pdf-error">
        {{ errorMsg }}
      </n-alert>

      <div
        v-for="page in pageCount"
        :key="page"
        class="ds-pdf-page"
        :style="{
          width: pageSizes[page - 1]?.width ? `${pageSizes[page - 1].width}px` : '100%',
        }"
      >
        <canvas ref="canvases" :data-page="page" />
        <div class="ds-pdf-page-no">{{ page }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .ds-pdf {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .ds-pdf-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--n-border-color, rgba(239, 239, 245, 1));
    flex: none;
  }

  .ds-pdf-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ds-pdf-pager {
    font-size: 13px;
    color: #555;
    min-width: 56px;
    text-align: center;
  }

  .ds-pdf-body {
    position: relative;
    overflow: auto;
    background: #525659;
    padding: 16px;
    flex: 1;
    min-height: 0;
  }

  .ds-pdf-loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ds-pdf-error {
    margin-bottom: 12px;
  }

  .ds-pdf-page {
    position: relative;
    margin: 0 auto 16px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    width: fit-content;
    max-width: 100%;
  }

  .ds-pdf-page canvas {
    display: block;
    max-width: 100%;
  }

  .ds-pdf-page-no {
    position: absolute;
    bottom: 4px;
    right: 8px;
    font-size: 11px;
    color: rgba(0, 0, 0, 0.35);
    user-select: none;
  }
</style>
