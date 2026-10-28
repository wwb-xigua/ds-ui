<template>
  <div
    class="top"
    v-if="
      !!slots?.operate ||
      !!slots?.prefixToolbar ||
      !!slots?.suffixToolbar ||
      !!getBindValue?.['toolbarConfig']
    "
  >
    <div class="operate">
      <slot name="operate"></slot>
    </div>
    <div class="toolbar">
      <!--前工具栏插槽-->
      <slot name="prefixToolbar"></slot>
      <!--刷新列表tertiary-->
      <n-tooltip
        :show-arrow="false"
        placement="top"
        trigger="hover"
        v-if="getBindValue?.['toolbarConfig']?.['reset']"
      >
        <template #trigger>
          <n-button
            circle
            tertiary
            :secondary="!!computedSorts.sorts?.length || !!computedFilters.filters?.length"
            type="primary"
            @click="loadData(null, true)"
          >
            <template #icon>
              <component
                :is="getBindValue?.toolbarConfig?.iconMap?.reset"
                v-if="getBindValue?.toolbarConfig?.iconMap?.reset"
              />
              <s-icon
                v-else
                icon="reset"
                :size="20"
                :color="getBindValue?.toolbarConfig?.iconMap?.iconColor"
              />
              <!-- <s-icon
                icon="left-fix-active"
                :size="20"
                :color="getBindValue?.toolbarConfig?.iconMap?.iconColor"
                style="width: 15px; height: 15px"
              /> -->
            </template>
          </n-button>
        </template>
        刷新并重置列（筛选: {{ computedFilters.filters?.length }} 排序:
        {{ computedSorts.sorts?.length }}）
      </n-tooltip>
      <n-tooltip
        :show-arrow="false"
        placement="top"
        trigger="hover"
        v-if="getBindValue?.['toolbarConfig']?.['refresh']"
      >
        <template #trigger>
          <n-button circle tertiary type="primary" @click="loadData(null, false)">
            <template #icon>
              <component
                :is="getBindValue?.['toolbarConfig']?.iconMap?.refresh"
                v-if="getBindValue?.['toolbarConfig']?.iconMap?.refresh"
              />
              <s-icon
                v-else
                icon="refresh"
                :size="20"
                :color="getBindValue?.toolbarConfig?.iconMap?.iconColor"
              />
            </template>
          </n-button>
        </template>
        刷新不重置列（筛选: {{ computedFilters.filters?.length }} 排序:
        {{ computedSorts.sorts?.length }}）
      </n-tooltip>

      <!--自定义列功能-->
      <customColumn
        v-model="computeCustomCols"
        v-if="getBindValue?.['toolbarConfig']?.['custom']"
        :icon-map="getBindValue?.toolbarConfig?.iconMap"
      />
      <!--后工具栏插槽-->
      <slot name="suffixToolbar"></slot>
    </div>
  </div>
  <n-data-table v-bind="getBindValue" :columns="computeColumns" ref="tableRef">
    <template #empty>
      <empty :bg-icon="getBindValue?.toolbarConfig?.iconMap?.bgIcon" />
    </template>
  </n-data-table>
</template>

<script setup lang="ts" name="Table">
  import { NButton, NTooltip } from 'naive-ui';
  import empty from './components/empty.vue';
  import {
    computed,
    getCurrentInstance,
    h,
    nextTick,
    onBeforeMount,
    onMounted,
    reactive,
    ref,
    unref,
    useAttrs,
    useSlots,
    watch,
  } from 'vue';
  import type { TableProps } from 'naive-ui';
  import { basicProps } from './props';
  import { deepMerge } from '../../modal/src/utils';
  import { TableActionType } from './types';
  import { merge } from '../../_shared/utils';
  import { DataTableBaseColumn } from 'naive-ui';
  import { useWindowSizeFn } from '../../card/src/hooks/useWindowSizeFn';
  import { getViewportOffset } from '../../card/src/utils/domUtils';
  import { useElementSize } from '@vueuse/core';
  import filterText from './components/filterText.vue';
  import filterMultipleChoice from './components/filterMultipleChoice.vue';
  import filterSingleChoice from './components/filterSingleChoice.vue';
  import filterTreeMultipleChoice from './components/filterTreeMultipleChoice.vue';
  import filterDatePicker from './components/filterDatePicker.vue';
  import filterNumber from './components/filterNumber.vue';
  import customColumn from './components/customColumn.vue';
  import { isEmpty, isNumber } from '../../_shared/utils';
  import { omitTitleRender, resolveTableColumnTitle } from './utils/column';

  const slots = useSlots();
  const props = defineProps({ ...basicProps });
  const emit = defineEmits(['register']);
  const attrs = useAttrs();
  const propsRef = ref<Partial<TableProps> | { columns: [] }>({ columns: [] });
  const getProps = computed(() => {
    return { ...props, ...(unref(propsRef) as any) };
  });
  /**
   * @description 刷新重置过滤器和排序逻辑
   */
  const resetFilterAndSort = () => {
    // 递归处理嵌套列
    const resetColumnFilters = (columns: any[]) => {
      if (!columns) return;
      columns.forEach((item: any) => {
        item['filterOptionValue'] = null;
        item['sortOrder'] = false;
        // 递归处理子列
        if ((item as any).children && (item as any).children.length) {
          resetColumnFilters((item as any).children);
        }
      });
    };
    resetColumnFilters(unref(propsRef.value?.['columns']));
  };

  const computeCustomCols = computed(() => {
    const cols = propsRef.value?.['columns'].filter((item: DataTableBaseColumn) => !item['hidden']);
    return cols;
  });

  /**
   * @description: 计算列
   * @return {*}
   */
  const computeColumns = computed(() => {
    const showCustom = getBindValue.value?.['toolbarConfig']?.['custom'];

    // 递归处理列和子列
    const processColumns = (columns: DataTableBaseColumn[]) => {
      if (!columns) return [];
      return columns.map((item: DataTableBaseColumn) => {
        let filterObj = {};
        // 文本类型过滤器
        if (item?.['filterType'] === 'text') {
          filterObj = {
            renderFilterMenu: ({ hide }) => {
              return h(filterText, {
                onHide: () => handleHide(item, hide),
                onConfirm: (value) => handleConfirm(value, item, hide),
                onConfirmNull: () => handleConfirmNull(item, hide),
                column: item,
                notNull: propsRef.value?.['notNull'],
              });
            },
          };
        }
        // 数字类型过滤器
        if (item?.['filterType'] === 'number') {
          filterObj = {
            renderFilterMenu: ({ hide }) => {
              return h(filterNumber, {
                onHide: () => handleHide(item, hide),
                onConfirm: (value) => handleConfirm(value, item, hide),
                onConfirmNull: () => handleConfirmNull(item, hide),
                column: item,
                notNull: propsRef.value?.['notNull'],
              });
            },
          };
        }
        // 枚举类型过滤器（多选）
        if (item?.['filterType'] === 'multipleChoice') {
          filterObj = {
            renderFilterMenu: ({ hide }) => {
              return h(filterMultipleChoice, {
                onHide: () => handleHide(item, hide),
                onConfirm: (value) => handleConfirm(value, item, hide),
                onConfirmNull: () => handleConfirmNull(item, hide),
                column: item as any,
                notNull: propsRef.value?.['notNull'],
              });
            },
          };
        }
        // 枚举类型过滤器（单选）
        if (item?.['filterType'] === 'singleChoice') {
          filterObj = {
            renderFilterMenu: ({ hide }) => {
              return h(filterSingleChoice, {
                onHide: () => handleHide(item, hide),
                onConfirm: (value) => handleConfirm(value, item, hide),
                onConfirmNull: () => handleConfirmNull(item, hide),
                column: item as any,
                notNull: propsRef.value?.['notNull'],
              });
            },
          };
        }
        // 树型枚举过滤器
        if (item?.['filterType'] === 'treeMultipleChoice') {
          filterObj = {
            renderFilterMenu: ({ hide }) => {
              return h(filterTreeMultipleChoice, {
                onHide: () => handleHide(item, hide),
                onConfirm: (value) => handleConfirm(value, item, hide),
                onConfirmNull: () => handleConfirmNull(item, hide),
                column: item as any,
                notNull: propsRef.value?.['notNull'],
              });
            },
          };
        }
        // 日期类型过滤器
        if (item?.['filterType'] === 'datePicker') {
          filterObj = {
            renderFilterMenu: ({ hide }) => {
              return h(filterDatePicker, {
                onHide: () => handleHide(item, hide),
                onConfirm: (value) => handleConfirm(value, item, hide),
                onConfirmNull: () => handleConfirmNull(item, hide),
                column: item,
                notNull: propsRef.value?.['notNull'],
              });
            },
          };
        }

        const processedColumn = {
          ellipsis: {
            tooltip: true,
          },
          ellipsisComponent: 'performant-ellipsis',
          resizable: true,
          ...filterObj,
          ...omitTitleRender(item as any),
          title: resolveTableColumnTitle(item as any),
        };
        // 递归处理子列
        if ((item as any).children && (item as any).children.length) {
          (processedColumn as any).children = processColumns((item as any).children);
        }

        return processedColumn;
      });
    };

    const processedCols = processColumns(unref(computeCustomCols));
    // Match the column panel's semantics (`customColumn.vue`): a column is
    // visible unless explicitly `show: false`. A truthy check here would hide
    // every column that never set `show`, emptying the table as soon as
    // `toolbarConfig.custom` is enabled.
    return showCustom ? processedCols.filter((v: any) => v['show'] !== false) : processedCols;
  });

  /**
   * @description: 计算表格 scroll-x 数值
   * @param {*} computed
   * @return {*}
   */
  const computeScrollX = computed(() => {
    if (!getProps.value?.autoScrollX) return undefined;
    let num = 0;
    unref(computeCustomCols).forEach((item: DataTableBaseColumn) => {
      item.width &&
        isNumber(item.width) &&
        (item as any)['show'] !== false &&
        (num += item.width as number);
    });
    return num;
  });

  /**
   * @description: 处理排序逻辑
   */
  const handleSorterChange = async (sorter: any) => {
    const { columnKey, order } = sorter;

    // 递归处理列排序
    const processSort = async (columns: any[]) => {
      if (!columns) return;
      for (const column of columns) {
        if (column.sortOrder === undefined) continue;

        if (!sorter) {
          column.sortOrder = false;
        } else if (column.key === columnKey) {
          column.sortOrder = order;
        } else {
          column.sortOrder = false;
        }

        // 递归处理子列
        if ((column as any).children && (column as any).children.length) {
          await processSort((column as any).children);
        }
      }
    };

    await processSort(unref(propsRef.value?.['columns']));

    // 如果有排序变化，重新加载数据
    if (sorter) {
      await loadData().catch(() => {
        // 如果加载失败，重置排序
        processSort(unref(propsRef.value?.['columns']));
      });
    }
  };

  const tableRef = ref();
  const tableProps = reactive({
    // Seed from the `data` prop so that `<s-table :data="rows" />` works
    // without an `api`. `tableProps` is merged *after* the declared props in
    // `getBindValue`, so an empty initialiser here would shadow whatever the
    // caller passed and render an empty table.
    data: (unref(props as any).data as any[]) || [],
    scrollX: computeScrollX,
    'on-update:sorter': handleSorterChange,
  });
  const tempQueryParams = ref({}); // 临时查询参数

  const getBindValue = computed(() => {
    const mergedProps = {
      ...attrs,
      ...unref(getProps),
      ...unref(tableProps),
      ...unref(propsRef),
    };

    if (mergedProps.tbPadding !== undefined) {
      mergedProps.style = {
        ...(mergedProps.style || {}),
        '--n-td-padding': `${mergedProps.tbPadding}px`,
        '--n-th-padding': `${mergedProps.tbPadding}px`,
      };
    }

    return mergedProps;
  });

  /**
   * @description: 处理过滤器-重置事件
   */
  const handleHide = (item: any, hide: Function) => {
    item.filterOptionValue = null;
    item.isNull = false;
    hide();
    // 重置分页参数
    const { showPagination } = getBindValue.value;
    showPagination && (tableProps['pagination']['page'] = 1);
    loadData();
  };

  /**
   * @description: 处理过滤器-查询事件
   */
  const handleConfirm = (value: any, item: any, hide: Function) => {
    item.filterOptionValue = value;
    item.isNull = false;
    hide();
    // 重置分页参数
    const { showPagination } = getBindValue.value;
    showPagination && (tableProps['pagination']['page'] = 1);
    loadData().catch(() => (item.filterOptionValue = null));
  };

  /**
   * @description: 处理过滤器-空值查询事件
   */
  const handleConfirmNull = async (item: any, hide: Function) => {
    item.filterOptionValue = 'null';
    item.isNull = true;
    hide();
    // 重置分页参数
    const { showPagination } = getBindValue.value;
    showPagination && (tableProps['pagination']['page'] = 1);
    loadData().catch(() => (item.filterOptionValue = null));
  };

  async function setProps(tableProps: Partial<TableProps>): Promise<void> {
    propsRef.value = deepMerge(unref(propsRef) || ({} as any), tableProps);
  }

  watch(
    () => propsRef.value?.['api'],
    () => {
      getBindValue.value?.autoLoad && loadData();
    },
  );

  // Keep `tableProps.data` in sync when the caller drives the table through the
  // `data` prop instead of an `api`. In remote mode `loadData` owns this field;
  // here the prop is the source of truth.
  watch(
    () => [unref(getProps).data, unref(getProps).api] as const,
    ([nextData, api]) => {
      if (!api && nextData) {
        tableProps.data = nextData as any[];
      }
    },
    { immediate: true },
  );

  /**
   * @description: 表格分页
   */
  const handelPagination = () => {
    const { showPagination } = getBindValue.value;
    if (!showPagination) return;
    tableProps['pagination'] = {
      page: 1,
      pageSize: 10,
      showSizePicker: true,
      pageSizes: [
        {
          label: '每页10条',
          value: 10,
        },
        {
          label: '每页20条',
          value: 20,
        },
        {
          label: '每页30条',
          value: 30,
        },
        {
          label: '每页50条',
          value: 50,
        },
      ],
      pageSlot: 5,
      displayOrder: ['size-picker', 'pages'],
      prefix({ itemCount }) {
        return `共 ${itemCount} 条`;
      },
      onUpdatePageSize: (pageSize: number) => {
        tableProps['pagination'].page = 1;
        tableProps['pagination'].pageSize = pageSize;
        loadData('PAGING_EVENT');
      },
      onUpdatePage: (page: number) => {
        tableProps['pagination'].page = page;
        loadData('PAGING_EVENT');
      },
    };
  };

  /**
   * @description: 计算列排序数据
   * @param {*} computed
   * @return {*}
   */
  const computedSorts = computed(() => {
    const sorts: any[] = [];

    // 递归收集所有列的排序条件
    const collectSorts = (columns: any[]) => {
      if (!columns) return;
      columns.forEach((item: any) => {
        // 收集当前列的排序条件
        item?.sortOrder &&
          sorts.push({
            field: item.key || item.dataIndex,
            order: item?.sortOrder == 'descend' ? 'desc' : 'asc',
          });

        // 递归收集子列的排序条件
        if ((item as any).children && (item as any).children.length) {
          collectSorts((item as any).children);
        }
      });
    };

    collectSorts(unref(propsRef.value?.['columns']));
    return { sorts };
  });

  /** 列筛选是否生效（单选为标量，需避免 lodash isEmpty 把 0 当成空） */
  const isColumnFilterActive = (item: any) => {
    const v = item?.filterOptionValue;
    if (item?.filterType === 'singleChoice' && !item?.isNull) {
      return v !== null && v !== undefined && v !== '';
    }
    return !isEmpty(v);
  };

  /**
   * @description: 计算列过滤数据
   * @param {*} computed
   * @return {*}
   */
  const computedFilters = computed(() => {
    const filters: any[] = [];

    // 递归收集所有列的过滤条件
    const collectFilters = (columns: any[]) => {
      if (!columns) return;
      columns.forEach((item: any) => {
        // 收集当前列的过滤条件
        isColumnFilterActive(item) &&
          filters.push({
            field: item.key || item.dataIndex,
            type: item.filterType,
            data: item.filterOptionValue,
            isNull: item.isNull,
          });

        // 递归收集子列的过滤条件
        if ((item as any).children && (item as any).children.length) {
          collectFilters((item as any).children);
        }
      });
    };

    collectFilters(unref(propsRef.value?.['columns']));
    return { filters };
  });

  /**
   * @description: 获取远程数据
   * @param params 查询参数
   * @param reset 是否重置列表(列排序&列过滤)
   */
  const loadData = async (params?: any, reset?: boolean) => {
    const {
      api,
      showPagination,
      pageField,
      pageSizeField,
      tableDataFiled,
      itemCountFiled,
      pageCountFiled,
    } = getBindValue.value;

    if (!api) return;
    if (reset) resetFilterAndSort();

    if (params !== 'PAGING_EVENT') {
      if (showPagination) {
        // 重置分页数据
        tableProps['pagination']['page'] = 1;
        tableProps['pagination']['pageSize'] = 10;
      }
      // 赋值临时查询参数
      params && (tempQueryParams.value = params);
    }

    let pageQueryData = showPagination
      ? {
          [pageField]: tableProps['pagination']['page'],
          [pageSizeField]: tableProps['pagination']['pageSize'],
        }
      : {};

    try {
      tableProps['loading'] = true;
      const res = await api(
        merge(
          pageQueryData,
          tempQueryParams.value,
          { form: tempQueryParams.value },
          computedSorts.value,
          computedFilters.value,
        ),
      );

      tableProps.data = tableDataFiled ? res?.[tableDataFiled] : res;

      if (showPagination) {
        tableProps['pagination'].itemCount = res?.[itemCountFiled] || 0;
        tableProps['pagination'].pageCount = res?.[pageCountFiled] || 1;
      }
      tableProps['loading'] = false;
    } finally {
      tableProps['loading'] = false;
    }
  };

  /**
   * @description: 获取表格当前过滤条件
   */
  const getTbFilterData = () => {
    const { showPagination, pageField, pageSizeField } = getBindValue.value;
    let pageQueryData = showPagination
      ? {
          [pageField]: tableProps['pagination']['page'],
          [pageSizeField]: tableProps['pagination']['pageSize'],
        }
      : {};
    return merge(
      pageQueryData,
      tempQueryParams.value,
      { form: tempQueryParams.value },
      computedSorts.value,
      computedFilters.value,
    );
  };

  /**
   * @description: 获取表格当前过滤条件（不包含form和filters属性）
   */
  const getTbFilterDataWithoutFormAndFilters = () => {
    const { showPagination, pageField, pageSizeField } = getBindValue.value;
    let pageQueryData = showPagination
      ? {
          [pageField]: tableProps['pagination']['page'],
          [pageSizeField]: tableProps['pagination']['pageSize'],
        }
      : {};
    return merge(pageQueryData, tempQueryParams.value, computedSorts.value);
  };

  /**
   * @description: 刷新当前页数据，保持当前分页状态和所有查询条件
   */
  const refreshCurrentPage = async () => {
    const { api, showPagination } = getBindValue.value;
    if (!api) return;

    // 获取当前的查询参数（包含分页信息、临时查询参数、排序和过滤条件）
    const currentQueryParams = getTbFilterData();

    try {
      tableProps['loading'] = true;
      const res = await api(currentQueryParams);

      // 更新表格数据，但保持分页状态不变
      const { tableDataFiled, itemCountFiled, pageCountFiled } = getBindValue.value;
      tableProps.data = tableDataFiled ? res?.[tableDataFiled] : res;

      if (showPagination) {
        tableProps['pagination'].itemCount = res?.[itemCountFiled] || 0;
        tableProps['pagination'].pageCount = res?.[pageCountFiled] || 1;
      }
      tableProps['loading'] = false;
    } finally {
      tableProps['loading'] = false;
    }
  };

  /**
   * @description 获取表格条目总数
   */
  const getTableTotal = () => {
    const { showPagination } = getBindValue.value;
    const total = showPagination
      ? tableProps['pagination']?.itemCount ?? 0
      : tableProps.data?.length ?? 0;
    return total;
  };

  // 监听指定元素高度变化
  getBindValue.value?.layoutShiftRefs &&
    watch(useElementSize(getBindValue.value?.layoutShiftRefs).height, () =>
      nextTick(() => computeTableHeight()),
    );

  /**
   * @description: 表格高度自适应
   */
  const computeTableHeight = async () => {
    await nextTick();

    const { maxHeight, fixedHeight, dynamicCustomHeightDifference, dynamicMinLines } =
      getBindValue.value;

    if (maxHeight) {
      // 设置自适应最大高度
      tableProps['flexHeight'] = false;
      tableProps['maxHeight'] = maxHeight as any;
    } else if (fixedHeight) {
      // 设置固定高度
      tableProps['flexHeight'] = true;
      tableProps['style'] = {
        height: fixedHeight + 'px',
      };
    } else {
      // 设置根据浏览器大小自动计算高度
      const table: any = unref(tableRef);
      const tableEl: any = table?.$el;

      // `$el` is not guaranteed to exist: the ref can be mid-update, and a
      // component rendering a fragment has no single root element. Bail out
      // rather than throwing — the table still renders, just without an
      // adaptive height.
      if (!tableEl?.querySelector) return;

      const headEl = tableEl.querySelector('.n-data-table-thead');
      if (!headEl) return;

      const { bottomIncludeBody } = getViewportOffset(headEl);
      let distanceFromBottom = 84; // 默认距离底部距离
      let height: number =
        bottomIncludeBody - (dynamicCustomHeightDifference || distanceFromBottom);
      // 表格高度小于设定值时按设定值处理
      let dynamicMinHeight = 95.6 + 44.8 * dynamicMinLines;
      height = height <= dynamicMinHeight ? dynamicMinHeight : height;

      tableProps['flexHeight'] = true;
      tableProps['style'] = {
        height: height + 'px',
      };
    }
  };

  onBeforeMount(() => {
    handelPagination();
  });

  useWindowSizeFn(computeTableHeight, 200);
  onMounted(async () => {
    await computeTableHeight();
  });

  const TableMethods: TableActionType = {
    setProps,
    loadData,
    getTbFilterData,
    getTbFilterDataWithoutFormAndFilters,
    refreshCurrentPage,
    getTableTotal,
  };

  const instance = getCurrentInstance();
  if (instance) {
    emit('register', TableMethods);
  }

  defineExpose({
    setProps,
    loadData,
    getTbFilterDataWithoutFormAndFilters,
    refreshCurrentPage,
  });
</script>

<style scoped lang="less">
  .flex {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .top {
    .flex();
    margin-bottom: 10px;
    justify-content: space-between;

    .operate,
    .toolbar {
      .flex();
      img {
        width: 20px;
        height: 20px;
      }
    }
  }
</style>
