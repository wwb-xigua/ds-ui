<!--
 * @Description: 表格操作设置
 * @Author: DJF
 * @LastEditors: Duan Jiefei
 * @Date: 2023-11-23 13:38:04
 * @LastEditTime: 2024-06-14 15:30:44
-->
<template>
  <n-popover trigger="hover" placement="bottom-end" arrow-point-to-center>
    <template #trigger>
      <n-button tertiary circle type="primary">
        <template #icon>
          <s-icon icon="column-configuration" :size="20" :color="props.iconMap?.iconColor" />
        </template>
      </n-button>
    </template>
    <template #header>
      <n-space align="center" justify="space-between">
        <n-checkbox
          :checked="checked"
          :indeterminate="indeterminate"
          @update:checked="handleCheckedChange"
          label="列展示"
        />
        <n-button size="small" text type="primary" @click="resetColumns"> 重置 </n-button>
      </n-space>
    </template>
    <div style="max-height: calc(50vh); overflow: auto; width: auto">
      <vue-draggable-next
        :list="(columns as any) || []"
        ghost-class="ghost"
        chosen-class="chosenClass"
        animation="150"
        handle=".handle"
        @change="handleDragChange"
      >
        <div v-for="item in columns || []" :key="item['order']" class="item">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 3px 0;
            "
          >
            <div style="display: flex; align-items: center; gap: 10px">
              <n-checkbox v-model:checked="item['show']">
                <div style="display: flex; align-items: center; gap: 5px">
                  <!-- <img
                    title="点击并上下拖动图标可以调整列的排序"
                    class="handle"
                    :src="moveIcon"
                    style="width: 16px; cursor: grabbing"
                  /> -->
                  <div
                    class="handle"
                    style="width: 15px; height: 15px; cursor: grabbing"
                    title="点击并上下拖动图标可以调整列的排序"
                  >
                    <s-icon icon="move-no-color" :size="16" />
                  </div>
                  <div>{{ getColumnDisplayTitle(item) }}</div>
                </div>
              </n-checkbox>
            </div>
            <div style="display: flex; align-items: center; gap: 0">
              <n-button
                title="列左固定"
                :style="{
                  width: '22px',
                  height: '22px',
                  padding: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  visibility: item['fixed'] == 'left' ? 'visible' : '',
                }"
                size="tiny"
                quaternary
                type="primary"
                @click="
                  item['fixed'] == 'left' ? (item['fixed'] = false) : (item['fixed'] = 'left')
                "
              >
                <s-icon
                  :icon="item['fixed'] == 'left' ? 'left-fix-active' : 'left-fix'"
                  :size="20"
                  :color="props.iconMap?.iconColor"
                  style="width: 15px; height: 15px"
                />
              </n-button>
              <n-button
                title="列右固定"
                :style="{
                  width: '22px',
                  height: '22px',
                  padding: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  visibility: item['fixed'] == 'right' ? 'visible' : '',
                }"
                size="tiny"
                quaternary
                type="primary"
                @click="
                  item['fixed'] == 'right' ? (item['fixed'] = false) : (item['fixed'] = 'right')
                "
              >
                <s-icon
                  :icon="item['fixed'] == 'right' ? 'right-fix-active' : 'right-fix'"
                  :size="20"
                  :color="props.iconMap?.iconColor"
                  style="width: 15px; height: 15px"
                />
              </n-button>
            </div>
          </div>
        </div>
      </vue-draggable-next>
    </div>
  </n-popover>
</template>

<script lang="ts" setup>
  import { VueDraggableNext } from 'vue-draggable-next';
  import { computed, ref, watch } from 'vue';
  import { useCloned } from '@vueuse/core';
  import { getColumnDisplayTitle } from '../utils/column';
  const props = defineProps<{
    iconMap?: {
      iconColor?: string;
      [key: string]: any;
    };
  }>();

  const columns: any = defineModel();

  // 排序==>重置排序
  // columns.value?.forEach((item: any, i: number) => {
  //   item['order'] = i + 1;
  // });
  const handleDragChange = () => {
    // 更新所有列的 order 值
    columns.value?.forEach((item: any, index: number) => {
      item.order = index + 1;
    });

    // 强制触发响应式更新
    columns.value = [...columns.value];
  };

  // 适配动态的 columns
  const cloned = ref();

  // 初始化克隆列配置
  const initClonedColumns = () => {
    if (columns.value) {
      cloned.value = useCloned(columns, { manual: true }).cloned.value;
    }
  };

  // 组件挂载时立即初始化
  initClonedColumns();

  // 监听columns变化时更新克隆
  watch(
    () => columns.value,
    () => {
      initClonedColumns();
    },
  );

  /**
   * @description: 重置
   */
  const resetColumns = () => {
    // 确保columns和cloned都有值
    if (!columns.value || !cloned.value) {
      console.warn('无法重置列：列配置或原始配置未初始化');
      return;
    }

    columns.value.forEach((item: any) => {
      const oldItem = cloned.value.find((v: any) => v.key == item.key);
      if (oldItem) {
        item.show = oldItem.show;
        item.fixed = oldItem.fixed;
        item.order = oldItem.order;
      }
    });

    // 重新排序并触发响应式更新
    columns.value = [...columns.value.sort((a: any, b: any) => a.order - b.order)];
  };

  // 全选
  const checked = computed(
    () => columns.value?.filter((v: any) => v.show != false).length == columns.value?.length,
  );

  // 半选
  const indeterminate = computed(
    () =>
      columns.value?.filter((v: any) => v.show != false).length > 0 &&
      columns.value?.filter((v: any) => v.show != false).length < columns.value?.length,
  );

  /**
   * @description: 全选/取消全选
   * @param {*} check
   */
  const handleCheckedChange = (check: boolean) => {
    columns.value?.forEach((item: any) => {
      item['show'] = check;
    });
  };
</script>

<style lang="less" scoped>
  .item {
    border-radius: 0;
  }

  .item:hover {
    background-color: #eef6f6;
  }

  .ghost {
    border-radius: 4px;
    border: 1px dashed #109594 !important;
  }

  .chosenClass {
    border-radius: 4px;
    background-color: #eef6f6;
  }
</style>
