<template>
  <n-modal
    :id="SModalId"
    :key="SModalId"
    v-bind="getBindValue"
    :autoFocus="false"
    :style="`width:${getWidth}px`"
    v-model:show="iSModal"
    @close="onCloseModal"
  >
    <div class="modal-container">
      <div class="top" :id="SModalBarId" :class="{ 'cursor-move': isDraggable }">
        <div class="left">
          <n-space :size="5" align="center">
            <img class="img-warning" :src="warning" v-if="getBindValue.iconType === 'warning'" />
            <div class="vertical-line" v-else-if="getBindValue.iconType === 'primary'"></div>
            <div class="title">
              <div>
                <n-ellipsis :style="`max-width:${getWidth - 98}px`">
                  {{ getBindValue.title }}
                </n-ellipsis>
              </div>
              <div class="titleSuffix">
                <n-ellipsis :style="`max-width:${getWidth - 98}px`">
                  {{ getBindValue.titleSuffix }}
                </n-ellipsis>
              </div>
            </div>
          </n-space>
        </div>
        <n-button size="tiny" quaternary :focusable="false" @click="closeModal">
          <img :src="close" />
        </n-button>
      </div>

      <div class="content">
        <slot name="default"></slot>
      </div>

      <slot name="prefix"></slot>

      <div class="footer" v-if="props.showAction && !$slots.action">
        <n-space v-if="!$slots.action" justify="center" :size="20">
          <slot name="prefixFooter"></slot>
          <n-button @click="closeModal" ghost type="primary">{{ cancelBtnText }}</n-button>
          <slot name="centerFooter"></slot>
          <n-button :loading="subLoading" type="primary" @click="handleSubmit">
            {{ subBtnText }}
          </n-button>
          <slot name="suffixFooter"></slot>
        </n-space>
      </div>

      <div class="footer" v-if="props.showAction && $slots.action">
        <slot name="action"></slot>
      </div>

      <slot name="suffix"></slot>
    </div>
  </n-modal>
</template>

<script lang="ts" setup name="Modal">
  import { getCurrentInstance, ref, unref, computed, useAttrs, nextTick } from 'vue';
  import { basicProps } from './props';
  import { deepMerge } from './utils';
  import { ModalProps, ModalMethods } from './type';
  import { uniqueId } from '../../_shared/utils';
  import warning from './icons/warning.svg?url';
  import close from './icons/close.svg?url';
  const attrs = useAttrs();
  const props = defineProps({ ...basicProps });

  const emit = defineEmits(['on-close', 'on-ok', 'register']);

  const propsRef = ref<Partial<ModalProps> | null>(null);

  const iSModal = ref(false);
  const subLoading = ref(false);

  const SModalId = uniqueId('s-modal-');
  const SModalBarId = uniqueId('s-modal-bar-');

  const getProps = computed(() => {
    return { ...props, ...(unref(propsRef) as any) };
  });

  const getWidth = computed(() => {
    const { width } = unref(propsRef) as any;
    return width || props.width;
  });

  const subBtnText = computed(() => {
    const { subBtnText } = propsRef.value as any;
    return subBtnText || props.subBtnText;
  });

  const cancelBtnText = computed(() => {
    const { cancelBtnText } = propsRef.value as any;
    return cancelBtnText || props.cancelBtnText;
  });

  async function setProps(modalProps: Partial<ModalProps>): Promise<void> {
    propsRef.value = deepMerge(unref(propsRef) || ({} as any), modalProps);
  }

  const isDraggable = computed(() => {
    return unref(getProps).isDraggable;
  });

  const getBindValue = computed(() => {
    return {
      ...attrs,
      ...unref(getProps),
      ...unref(propsRef),
    };
  });

  function setSubLoading(status: boolean) {
    subLoading.value = status;
  }

  function openModal() {
    iSModal.value = true;
    if (!unref(getProps).isDraggable) return;
    nextTick(() => {
      const oBox = document.getElementById(SModalId);
      const oBar = document.getElementById(SModalBarId);
      if (!oBox || !oBar) {
        console.warn('[ds-ui] SModal: drag handle not found, skipping drag');
        return;
      }

      // `isDraggable` relies on a micro-frontend runtime exposing
      // `window.microApp.getData().startDrag`. When the host does not provide it
      // (a regular SPA, for example) the modal still opens; only dragging is
      // unavailable.
      const startDrag = (window as any).microApp?.getData?.()?.startDrag;
      if (typeof startDrag !== 'function') {
        if (import.meta.env.DEV) {
          console.warn(
            '[ds-ui] SModal: isDraggable is enabled but no micro-frontend runtime ' +
              'was found on `window.microApp`. Dragging is disabled.',
          );
        }
        return;
      }

      startDrag(oBar, { target: oBox });
    });
  }

  function closeModal() {
    iSModal.value = false;
    subLoading.value = false;
    emit('on-close');
  }

  function onCloseModal() {
    iSModal.value = false;
    emit('on-close');
  }

  function handleSubmit() {
    // subLoading.value = true;
    emit('on-ok');
  }

  const modalMethods: ModalMethods = {
    setProps,
    openModal,
    closeModal,
    setSubLoading,
  };

  const instance = getCurrentInstance();
  if (instance) {
    emit('register', modalMethods);
  }

  defineExpose({
    openModal,
    closeModal,
    setProps,
    setSubLoading,
    handleSubmit,
  });
</script>

<style lang="less" scoped>
  .modal-container {
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 4px 20px 2px rgba(0, 204, 202, 0.1);

    .cursor-move {
      cursor: move;
    }

    .top {
      height: 40px;
      border-bottom: 1px solid #f2f0fd;
      box-sizing: border-box;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .left {
        .img-warning {
          width: 23.5px;
          height: 23.5px;
          display: flex;
        }

        .img-primary {
          display: flex;
          height: 15px;
        }

        .title {
          display: flex;
          align-items: center;
          color: #222625;
          font-size: 18px;
          font-weight: 500;
        }
        .titleSuffix {
          font-size: 14px;
          margin-left: 10px;
        }
      }

      .icon {
        color: #b5b5b5;
      }

      .n-button {
        height: 24px;
        width: 24px;
        padding: 0;
      }

      .vertical-line {
        width: 3.5px;
        height: 17px;
        background: #109594;
        border-radius: 3px;
      }
    }

    .content {
      padding: 20px;
    }

    .footer {
      padding: 0 20px 20px 20px;
    }
  }
</style>
