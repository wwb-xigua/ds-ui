<template>
  <n-config-provider>
    <n-drawer
      v-bind="getBindValue"
      :title="null"
      v-model:show="isSDrawer"
      @update:show="onUpdateShow"
      class="drawer-container"
    >
      <n-drawer-content v-bind="getBindValue" :autofocus="false">
        <!-- 头部 -->
        <template #header>
          <div class="drawer-header">
            <!-- 标题排印 -->
            <div class="drawer-vertical-line"></div>
            <!-- 标题左侧插槽 -->
            <slot name="header-left"></slot>
            <!-- 标题 -->
            <div>{{ getBindValue.title }}</div>
            <!-- 标题右侧插槽 -->
            <slot name="header-right"></slot>
          </div>
        </template>
        <!-- 内容 -->
        <div class="content">
          <slot name="default"></slot>
        </div>
        <!-- 底部及动作 -->
        <template #footer v-if="getBindValue.showAction && !$slots.footer">
          <n-space justify="center">
            <!-- 底部按钮，左侧内容 -->
            <slot name="prefixFooter"></slot>
            <n-button @click="closeDrawer" ghost type="primary">{{ cancelBtnText }}</n-button>
            <!-- 底部按钮，中间内容 -->
            <slot name="centerFooter"></slot>
            <!-- 底部按钮，右侧内容 -->
            <n-button
              :loading="subLoading"
              type="primary"
              @click="handleSubmit"
              v-if="getBindValue.showSubmitBtn"
            >
              {{ subBtnText }}
            </n-button>
            <slot name="suffixFooter"></slot>
          </n-space>
        </template>
        <template #footer v-if="getBindValue.showAction && $slots.footer">
          <slot name="footer"></slot>
        </template>
      </n-drawer-content>
    </n-drawer>
  </n-config-provider>
</template>

<script lang="ts" setup name="Drawer">
  import { getCurrentInstance, ref, unref, computed, useAttrs } from 'vue';
  import { drawerSProps } from './props';
  import { deepMerge } from './utils';
  import { DrawerProps, DrawerMethods } from './type';
  import { NConfigProvider } from 'naive-ui';

  const attrs = useAttrs();
  const props = defineProps({ ...drawerSProps });

  const emit = defineEmits(['on-close', 'on-ok', 'register']);

  const propsRef = ref<Partial<DrawerProps> | null>(null);

  const isSDrawer = ref(false);
  const subLoading = ref(false);

  const getProps = computed(() => {
    return { ...props, ...(unref(propsRef) as any) };
  });

  const subBtnText = computed(() => {
    const { subBtnText } = propsRef.value as any;
    return subBtnText || props.subBtnText;
  });

  const cancelBtnText = computed(() => {
    const { cancelBtnText } = propsRef.value as any;
    return cancelBtnText || props.cancelBtnText;
  });

  async function setProps(drawerProps: Partial<DrawerProps>): Promise<void> {
    propsRef.value = deepMerge(unref(propsRef) || ({} as any), drawerProps);
  }

  const getBindValue = computed(() => {
    return {
      ...attrs,
      ...unref(getProps),
      ...unref(propsRef),
    };
  });

  // 设置 默认确认按键的loading
  function setSubLoading(status: boolean) {
    subLoading.value = status;
  }

  // 打开
  function openDrawer() {
    isSDrawer.value = true;
  }

  // 关闭
  function closeDrawer() {
    isSDrawer.value = false;
    subLoading.value = false;
    emit('on-close');
  }

  // 抽屉显示状态改变时执行的回调函数
  function onUpdateShow(show) {
    !show && emit('on-close');
  }

  // 确认
  function handleSubmit() {
    emit('on-ok');
  }

  const drawerMethods: DrawerMethods = {
    setProps,
    openDrawer,
    closeDrawer,
    setSubLoading,
  };

  const instance = getCurrentInstance();
  if (instance) {
    emit('register', drawerMethods);
  }

  defineExpose({
    openDrawer,
    closeDrawer,
    setProps,
    setSubLoading,
    handleSubmit,
  });
</script>

<style lang="less" scoped>
  .drawer-container {
    .drawer-header {
      display: flex;
      gap: 5px;
      align-items: center;
      line-height: 22px;

      .drawer-vertical-line {
        width: 3.5px;
        height: 17px;
        background: #109594;
        border-radius: 3px;
      }
    }
  }
</style>
