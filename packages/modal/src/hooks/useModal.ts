import { ref, unref, getCurrentInstance, watch, nextTick } from 'vue';
import { isProdMode } from '../utils';
import { ModalMethods, ModalProps, UseModalReturnType } from '../type';
import { getDynamicProps } from '../utils';
import { tryOnUnmounted } from '@vueuse/core';
import type { DynamicProps } from '/#/utils';
import type { FormProps } from '../../../form';

type Props = Partial<DynamicProps<FormProps>>;
export function useModal(props: Props): UseModalReturnType {
  const modalRef = ref<Nullable<ModalMethods>>(null);
  const currentInstance = getCurrentInstance();

  const getInstance = async () => {
    const instance = unref(modalRef.value);
    if (!instance) {
      console.error('useModal instance is undefined!');
    }
    await nextTick();
    return instance;
  };

  const register = (modalInstance: ModalMethods) => {
    isProdMode() &&
      tryOnUnmounted(() => {
        modalRef.value = null;
      });
    modalRef.value = modalInstance;
    currentInstance?.emit('register', modalInstance);

    watch(
      () => props,
      () => {
        props && modalInstance.setProps(getDynamicProps(props));
      },
      {
        immediate: true,
        deep: true,
      },
    );
  };

  const methods: ModalMethods = {
    setProps: async (modalProps: Partial<ModalProps>): Promise<void> => {
      const instance = await getInstance();
      instance?.setProps(modalProps);
    },
    openModal: async () => {
      const instance = await getInstance();
      instance?.openModal();
    },
    closeModal: async () => {
      const instance = await getInstance();
      instance?.closeModal();
    },
    setSubLoading: async (status) => {
      const instance = await getInstance();
      instance?.setSubLoading(status);
    },
  };

  return [register, methods];
}
