import { ref, unref, getCurrentInstance, watch } from 'vue';
import { isProdMode } from '../utils';
import { DrawerMethods, UseDrawerReturnType } from '../type';
import { getDynamicProps } from '../utils';
import { tryOnUnmounted } from '@vueuse/core';

// use drawer
export function useDrawer(props): UseDrawerReturnType {
  const drawerRef = ref<Nullable<DrawerMethods>>(null);
  const currentInstance = getCurrentInstance();

  const getInstance = () => {
    const instance = unref(drawerRef.value);
    if (!instance) {
      console.error('useDrawer instance is undefined!');
    }
    return instance;
  };

  const register = (drawerInstance: DrawerMethods) => {
    isProdMode() &&
      tryOnUnmounted(() => {
        drawerRef.value = null;
      });
    drawerRef.value = drawerInstance;
    currentInstance?.emit('register', drawerInstance);

    watch(
      () => props,
      () => {
        props && drawerInstance.setProps(getDynamicProps(props));
      },
      {
        immediate: true,
        deep: true,
      },
    );
  };

  const methods: DrawerMethods = {
    setProps: (props): void => {
      getInstance()?.setProps(props);
    },
    openDrawer: () => {
      getInstance()?.openDrawer();
    },
    closeDrawer: () => {
      getInstance()?.closeDrawer();
    },
    setSubLoading: (status) => {
      getInstance()?.setSubLoading(status);
    },
  };

  return [register, methods];
}
