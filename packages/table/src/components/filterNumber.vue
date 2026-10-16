<!--
 * @Description: 数字过滤器 - 渲染函数 渲染这一列的过滤器菜单
 * @Author: Duan Jiefei
 * @Date: 2024-06-07 15:10:59
 * @LastEditors: Duan Jiefei
 * @LastEditTime: 2024-06-17 14:47:11
-->
<template>
  <div class="filter">
    <div class="filter-content">
      <n-input
        ref="inputInstRef"
        pair
        separator="-"
        clearable
        v-model:value="inputValue"
        :placeholder="['开始数值', '结束数值']"
        @keyup.enter="confirm"
      />
    </div>
    <div class="filter-footer">
      <n-button size="tiny" @click="reset"> 重置 </n-button>
      <n-button size="tiny" type="primary" @click="confirm" :disabled="!inputValue">
        查询
      </n-button>
      <n-button
        v-if="!notNull"
        class="null-button"
        size="tiny"
        text
        title="空值查询"
        @click="confirmNull"
      >
        <svg
          :fill="column?.['isNull'] ? '#109594' : 'gray'"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
        >
          <path
            d="M968.192 822.272l-81.92-81.92c22.528-31.744 35.84-71.168 34.816-113.152-2.048-97.792-81.92-178.176-179.2-181.248-107.52-3.072-195.072 84.48-191.488 192 3.072 97.792 83.456 177.152 181.248 179.712 41.984 1.024 81.408-11.776 113.152-34.816l81.92 81.92c5.632 5.632 15.872 5.632 20.992 0l20.992-20.992c6.144-5.632 6.144-14.848-0.512-21.504z m-232.448-57.856c-73.216 0-132.608-59.392-132.608-132.608 0-76.8 65.024-137.728 142.336-132.096 65.536 4.608 118.784 57.856 122.368 122.368 5.12 77.824-56.32 142.336-132.096 142.336zM172.544 304.128l-81.92-148.48h-38.912v222.208h37.376V232.96l80.384 144.896H209.92V155.648h-37.376zM371.2 278.528c0 17.408-0.512 30.208-1.536 37.376-1.024 7.68-4.608 13.824-10.752 18.944-5.632 5.12-14.336 7.68-26.112 7.68-11.264 0-19.968-2.56-26.624-8.192-6.656-5.632-10.752-12.8-12.288-22.016-1.024-5.632-1.536-17.92-1.536-36.864V155.648h-40.448v118.272c0 25.088 1.536 43.52 4.096 56.32 2.048 8.704 5.632 16.896 11.264 24.576s13.312 14.336 23.552 18.944c9.728 5.12 24.576 7.168 43.52 7.168 15.872 0 28.672-2.048 38.4-6.656 9.728-4.608 17.92-10.752 23.552-17.92 5.632-7.68 9.728-16.896 12.288-28.16 2.048-11.264 3.072-29.696 3.072-56.32V155.648h-40.448v122.88zM595.968 340.48H495.616V157.696h-40.448v220.16h140.8zM765.952 340.48h-99.84V157.696h-40.448v220.16h140.288z"
          ></path>
        </svg>
      </n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { useMessage } from '../../../message';
  import type { InputInst } from 'naive-ui';

  const inputInstRef = ref<InputInst | null>(null);
  const emits = defineEmits(['hide', 'confirm', 'confirmNull']);
  const props = defineProps<{ column: {}; notNull?: boolean }>();

  const inputValue = ref(
    props.column?.['isNull'] ? null : props.column?.['filterOptionValue'] || null,
  );

  /**
   * @description: 判断是否为数值
   * @param {*} num
   */
  function isNumberCustom(num: any) {
    return !isNaN(parseFloat(num)) && isFinite(num);
  }

  /**
   * @description: 重置
   */
  const reset = () => emits('hide');

  /**
   * @description: 查询
   */
  const confirm = () => {
    const value = inputValue.value;
    if (
      value &&
      isNumberCustom(value[0]) &&
      isNumberCustom(value[1]) &&
      Number(value[0]) <= Number(value[1])
    ) {
      emits('confirm', inputValue.value);
    } else {
      useMessage().warning('请输入合法的数值范围');
    }
  };

  /**
   * @description: 空值查询
   */
  const confirmNull = () => emits('confirmNull');

  onMounted(() => {
    inputInstRef.value?.focus();
  });
</script>
<style lang="less" scoped>
  .filter {
    &-content {
      padding: 10px;
      width: 250px;
    }

    &-footer {
      border-top: 1px solid rgb(239, 239, 245);
      padding: 10px;
      display: flex;
      justify-content: center;
      gap: 10px;
      position: relative;
      .null-button {
        position: absolute;
        right: 5px;
        bottom: 5px;
      }
    }
  }
</style>
