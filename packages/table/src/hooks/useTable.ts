/*
 * @Description: useTable
 * @Author: DJF
 * @LastEditors: DJF
 * @Date: 2023-08-21 15:14:58
 * @LastEditTime: 2024-01-31 13:47:44
 */
import { computed, h, nextTick, onMounted, reactive, toRefs, unref, watch } from 'vue';
import { DataTableBaseColumn, NText } from 'naive-ui';
import { getViewportOffset } from '../../../card/src/utils/domUtils';
import { merge } from '../../../_shared/utils';
import { useElementSize } from '@vueuse/core';
import { useWindowSizeFn } from '../../../card/src/hooks/useWindowSizeFn';
import { ReturnType } from '../types';

/**
 * @description: 列表查询
 * @return {*}
 */
export function useTable({
  fixedHeight,
  maxHeight,
  dynamicMinLines = 3,
  dynamicCustomHeightDifference = 0,
  showPagination = true,
  autoLoad = true,
  autoScrollX = false,
  tableDataFiled = 'records',
  pageCountFiled = 'pages',
  itemCountFiled = 'total',
  extraField = [],
  pageField = 'current',
  pageSizeField = 'size',
  rowKey,
  columns,
  data,
  tableRefs,
  layoutShiftRefs,
  remote = true,
  api,
}): ReturnType {
  /**
   * @description: 计算列
   * @return {*}
   */
  const computeColumns = computed(() => {
    const cols: DataTableBaseColumn[] = [];
    unref(columns).forEach((item: DataTableBaseColumn) => {
      cols.push({
        ellipsis: {
          tooltip: true,
        },
        resizable: true,
        ...item,
      });
    });
    return cols.filter((col: any) => !col.hidden);
  });

  /**
   * @description: 计算表格 scroll-x 数值
   * @param {*} computed
   * @return {*}
   */
  const computeScrollX = computed(() => {
    let num = 0;
    unref(columns).forEach((item: DataTableBaseColumn) => {
      item.width && (num += item.width as number);
    });
    return num;
  });

  const DT = reactive({
    tableRef: null as any,
    dynamicColumns: [] as DataTableBaseColumn[],
    assignColumn: [] as any[],
    tempQueryData: {} as Recordable,
    getExtraFieldValue: {} as Recordable,
    getBindValue: {
      remote,
      striped: true,
      loading: false,
      bordered: false,
      bottomBordered: false,
      singleColumn: true,
      columns: computeColumns,
      scrollX: autoScrollX ? computeScrollX : undefined,
      data: (data || []) as any[],
      style: {} as Record<string, string>,
      rowKey: rowKey ? (row: Recordable) => row[rowKey] : undefined,
      flexHeight: false,
      maxHeight: undefined as number | undefined,
      renderCell: (value: any) => {
        return value ?? h(NText, { depth: 3 }, { default: () => '-' });
      },
    },
  });

  /**
   * @description: 表格分页
   */
  const handlePagination = () => {
    if (showPagination) {
      DT.getBindValue['pagination'] = {
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
        onUpdatePageSize: (pageSize) => {
          DT.getBindValue['pagination'].page = 1;
          DT.getBindValue['pagination'].pageSize = pageSize;
          loadData(null);
        },
        onUpdatePage: (page) => {
          DT.getBindValue['pagination'].page = page;
          loadData(null);
        },
      };
    }
  };

  handlePagination();
  // 监听指定元素高度变化
  layoutShiftRefs &&
    watch(useElementSize(layoutShiftRefs).height, () => nextTick(() => computeTableHeight()));

  /**
   * @description: 表格高度自适应
   */
  const computeTableHeight = async () => {
    await nextTick();
    if (maxHeight) {
      // 设置自适应最大高度
      DT.getBindValue.flexHeight = false;
      DT.getBindValue.maxHeight = maxHeight as any;
    } else if (fixedHeight) {
      // 设置固定高度
      DT.getBindValue.flexHeight = true;
      DT.getBindValue.style = {
        height: fixedHeight + 'px',
      };
    } else {
      // 设置根据浏览器大小自动计算高度
      const table: any = unref(DT.tableRef ?? tableRefs);
      const tableEl: any = table?.$el;
      // `$el` can be missing while the ref is updating or when the component
      // renders a fragment. Skip height adaptation instead of throwing.
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

      DT.getBindValue.flexHeight = true;
      DT.getBindValue.style = {
        height: height + 'px',
      };
    }
  };

  /**
   * @description: 获取远程数据
   */
  const loadData = async (params = null) => {
    if (params !== null) {
      if (showPagination) {
        // 重置分页参数
        DT.getBindValue['pagination']['page'] = 1;
        DT.getBindValue['pagination']['pageSize'] = 10;
      }
      // 赋值查询参数
      DT.tempQueryData = params;
    }
    DT.getBindValue.loading = true;
    let queryData = showPagination
      ? {
          [pageField]: DT.getBindValue['pagination']['page'],
          [pageSizeField]: DT.getBindValue['pagination']['pageSize'],
        }
      : {};

    try {
      const res: any = await api(merge(queryData, DT.tempQueryData));
      DT.getBindValue.data = res?.[tableDataFiled];

      extraField.forEach((item) => {
        DT.getExtraFieldValue[item] = res?.[item] as any;
      });

      if (showPagination) {
        DT.getBindValue['pagination'].itemCount = res?.[itemCountFiled] || 0;
        DT.getBindValue['pagination'].pageCount = res?.[pageCountFiled] || 1;
      }
      DT.getBindValue.loading = false;
    } catch (error) {
      DT.getBindValue.loading = false;
      console.error('[ds-ui] useTable loadData failed:', error);
    }
  };

  useWindowSizeFn(computeTableHeight, 200);
  onMounted(async () => {
    await computeTableHeight();
    autoLoad && (await loadData());
  });

  return {
    ...toRefs(DT),
    loadData,
  };
}
