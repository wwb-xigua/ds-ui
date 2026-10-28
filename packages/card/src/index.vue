<!--
 * @Description: Card 面板组件
 * @Author: DJF
 * @LastEditors: DJF
 * @Date: 2023-08-25 15:01:54
 * @LastEditTime: 2023-10-24 15:39:25
-->
<template>
  <div
    :class="{ 'card-box': true, 'card-box-shadow': shadow == 'always', 'card-box-border': border }"
    :style="computeMainStyle"
  >
    <n-spin size="medium" :show="loading">
      <!-- header区 -->
      <div class="header" v-if="showHeader">
        <!-- 标题区 -->
        <div class="left" :style="{ cursor: fold ? 'pointer' : '' }" @click="switchFold">
          <!-- 标题左侧插槽区 -->
          <div v-if="slots?.prefixTitle">
            <slot name="prefixTitle"></slot>
          </div>
          <img
            v-else-if="fold"
            :src="arrow"
            :style="{ transform: `rotate(${rotation}deg)`, transition: '0.2s' }"
          />
          <!-- 标题排印 -->
          <div class="vertical-line" v-else></div>
          <!-- 标题 -->
          <div class="title">
            {{ title }}
          </div>
          <!-- 标题右侧插槽区 -->
          <slot name="suffixTitle"></slot>
        </div>
        <!-- 头部额外内容 -->
        <div class="right">
          <slot name="headerExtra"></slot>
        </div>
      </div>

      <!-- 横向分割线 -->
      <div class="divide" v-if="showHeader && divide && !defaultFold"></div>

      <!-- 可折叠content区 -->
      <div v-if="fold" :style="{ height: showHeader ? 'calc(100% - 40px)' : '100%' }">
        <div style="display: flex; flex-direction: column; height: 100%" v-show="!defaultFold">
          <transition name="fade" appear mode="out-in">
            <div :class="{ 'card-content': true, 'card-content-min-height': empty }">
              <img class="empty-img" :src="emptyIcon" alt="" v-if="!loading && empty" />
              <slot name="default"></slot>
            </div>
          </transition>
          <div class="card-action" v-if="slots?.action">
            <slot name="action"></slot>
          </div>
        </div>
      </div>

      <!-- 不可折叠content区 -->
      <div
        :style="{
          display: 'flex',
          'flex-direction': 'column',
          height: showHeader ? 'calc(100% - 40px)' : '100%',
        }"
      >
        <div :class="{ 'card-content': true, 'card-content-min-height': empty }" v-if="!fold">
          <img :src="emptyIcon" alt="" v-if="!loading && empty" class="empty-img" />
          <slot name="default"></slot>
        </div>
        <div class="card-action" v-if="!fold && slots?.action">
          <slot name="action"></slot>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script lang="ts" setup name="Card">
  import { NSpin } from 'naive-ui';
  import { computed, toRef, ref, useSlots, nextTick } from 'vue';
  import emptyIcon from './icons/empty.svg?url';
  import arrow from './icons/arrow.svg?url';

  const slots = useSlots();

  interface IProps {
    title?: string; // 标题
    defaultFold?: boolean; // 是否默认折叠
    fold?: boolean; // 是否可折叠
    divide?: boolean; // 是否显示 header 分割线
    border?: boolean; // 是否显示边框
    contentPadding?: string; // 内容区padding
    shadow?: 'always' | 'hover' | 'never'; // 卡片阴影
    loading?: boolean; // 显示加载状态
    empty?: boolean; // 显示空数据状态
  }

  const props = withDefaults(defineProps<IProps>(), {
    title: '',
    defaultFold: false,
    fold: false,
    divide: true,
    border: false,
    contentPadding: '20px',
    shadow: 'hover',
    loading: false,
    empty: false,
  });

  const rotation = ref(props.defaultFold ? 0 : 90);

  const defaultFold = toRef(props.defaultFold);

  const showHeader = computed(
    () =>
      props.title || props.fold || slots?.prefixTitle || slots?.suffixTitle || slots?.headerExtra,
  );

  const computeMainStyle = computed(() => ({
    border: props.border ? '1px solid rgba(0, 0, 0, 0.10)' : '',
  }));

  const cardBoxHover = computed(() =>
    props.shadow == 'hover'
      ? '0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06),\n' +
        '    0 5px 12px 4px rgba(0, 0, 0, 0.04)'
      : 'none',
  );

  const emit = defineEmits(['switchFold']);

  /**
   * @description 折叠/展开事件
   */
  const switchFold = async () => {
    if (!props.fold) return;
    defaultFold.value = !defaultFold.value;
    rotation.value = rotation.value === 0 ? 90 : 0;
    await nextTick();
    emit('switchFold', defaultFold.value);
  };
</script>

<style lang="less" scoped>
  .card-box {
    background-color: #ffffff;
    border-radius: 4px;
    box-sizing: border-box;
    transition: box-shadow 0.5s;

    .header {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      justify-content: space-between;
      min-height: 18px;

      .left {
        display: flex;
        flex: 1;
        align-items: center;
        gap: 5px;

        img {
          width: 16px;
          height: 16px;
        }

        .vertical-line {
          width: 3px;
          height: 17px;
          background: #109594;
          border-radius: 3px;
        }

        .title {
          font-size: 18px;
          line-height: 18px;
          font-weight: 500;
          color: #222625;
        }
      }

      .right {
        display: flex;
        align-items: center;
        gap: 10px;

        img {
          width: 16px;
          height: 16px;
        }
      }
    }

    .divide {
      height: 1px;
      background-color: #f2f0fd;
    }

    .card-content {
      flex: 1;
      padding: v-bind(contentPadding) !important;
      position: relative;
      height: inherit;

      .empty-img {
        width: 150px;
        height: 150px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
      }
    }

    .card-content-min-height {
      min-height: 130px;
    }

    .card-action {
      border-radius: 4px;
      background-color: #fff !important;
      box-shadow: 0px -1px 5px 0px #e5e5e5;
      padding: 10px 20px;
      color: #b5baba;
      line-height: 20px;
    }
  }

  .card-box-shadow {
    box-shadow:
      0 1px 2px -2px rgba(0, 0, 0, 0.08),
      0 3px 6px 0 rgba(0, 0, 0, 0.06),
      0 5px 12px 4px rgba(0, 0, 0, 0.04);
  }

  .card-box-border {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .card-box:hover {
    box-shadow: v-bind(cardBoxHover);
  }

  :deep(.n-spin-container) {
    width: 100%;
    height: 100%;

    .n-spin-content {
      width: 100%;
      height: 100%;
    }
  }
</style>
