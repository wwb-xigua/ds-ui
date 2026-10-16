<!--
 * @Description: 消息组件
 * @Author: DJF
 * @LastEditors: Duan Jiefei
 * @Date: 2023-08-28 15:23:12
 * @LastEditTime: 2024-06-13 16:27:09
-->
<template>
  <div class="message-box">
    <n-spin v-if="type == 'loading'" class="n-spin" :size="16" stroke="#109594" />
    <img v-else :src="src" alt="" />
    <div class="message-content">{{ content }}</div>
    <n-button
      quaternary
      size="tiny"
      @click="emits('close')"
      style="padding: 0px 4px; margin-top: 1px"
    >
      <template #icon>
        <img :src="close" alt="" />
      </template>
    </n-button>
  </div>
</template>

<script lang="ts" setup name="Message">
  import { computed } from 'vue';
  import { NSpin, NButton } from 'naive-ui';
  import error from './icons/error.svg?url';
  import info from './icons/info.svg?url';
  import success from './icons/success.svg?url';
  import warning from './icons/warning.svg?url';
  import close from './icons/close.svg?url';

  const emits = defineEmits([close]);
  interface IProps {
    type: 'info' | 'success' | 'warning' | 'error' | 'loading'; // 消息类型
    content: string; // 消息内容
  }

  const props = withDefaults(defineProps<IProps>(), {
    type: 'info',
    content: '这是一条消息',
  });

  const src = computed(() =>
    props.type == 'info'
      ? info
      : props.type == 'success'
      ? success
      : props.type == 'warning'
      ? warning
      : error,
  );

  const primaryColor = computed(() => {
    return props.type == 'info'
      ? '#969999'
      : props.type == 'success'
      ? '#64d683'
      : props.type == 'warning'
      ? '#F47E29'
      : props.type == 'error'
      ? '#FE5A49'
      : '#109594';
  });

  const backgroundColor = computed(() => {
    return props.type == 'info'
      ? '#F3F3F3'
      : props.type == 'success'
      ? '#E5FEF1'
      : props.type == 'warning'
      ? '#FEF2E8'
      : props.type == 'error'
      ? '#FEEDEA'
      : '#E5F3F3';
  });
</script>

<style lang="less" scoped>
  .message-box {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 290px;
    max-width: 500px;
    padding: 8px 10px;
    border-radius: 4px;
    border: 1px solid v-bind(primaryColor);
    background: v-bind(backgroundColor);
    color: v-bind(primaryColor);
    line-height: 24px;
    font-size: 16px;
    box-shadow:
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);

    .n-spin {
      margin-right: 3px;
    }

    .message-content {
      word-break: break-all;
      flex: 1;
    }

    img {
      width: 24px;
      height: 24px;
    }
  }
</style>
