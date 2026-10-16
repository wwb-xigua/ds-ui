import { Component, MaybeRef, Ref } from 'vue';
import { DataTableBaseColumn } from 'naive-ui';
import type { DataTableColumns, TableProps } from 'naive-ui';
import type { DynamicProps } from '/#/utils';
import type { STableTitleRender } from '../utils/column';

/** useSTable columns 扩展字段 */
export type STableColumn<T = Record<string, unknown>> = DataTableBaseColumn<T> & {
  /** 表头自定义渲染（函数 | 字符串）；默认 false，沿用 title 渲染逻辑 */
  titleRender?: STableTitleRender;
  show?: boolean;
  hidden?: boolean;
  order?: number;
  filterType?: string;
  [key: string]: unknown;
};

export type STableColumns<T = Record<string, unknown>> = STableColumn<T>[];

export type STableProps = {
  notNull?: boolean; // 是否不空
  api?: () => Promise<any>; // API 接口
  remote?: boolean; // 是否远程
  autoLoad?: boolean; // 是否自动加载
  maxHeight?: number; // 表格最大高度
  dynamicMinLines?: number; // 表格动态高度下最小展示内容行数
  fixedHeight?: number; // 表格固定高度
  dynamicCustomHeightDifference?: number; // 表格动态自定义高度差
  showPagination?: boolean; // 是否显示分页
  autoScrollX?: boolean; // 是否自动计算 scroll-x

  /**
   * Column definitions.
   *
   * Accepts a plain array or a `ref()`. Internally every value is unwrapped with
   * `unref`, so both forms behave identically.
   */
  columns: MaybeRef<STableColumns | DataTableColumns>;

  /** Row data. Accepts a plain array or a `ref()`. */
  data?: MaybeRef<Array<Record<string, any>>>;

  tableRefs?: MaybeRef<HTMLElement | null>; // table Ref (适用于多个table情况动态计算高度)
  layoutShiftRefs?: MaybeRef<HTMLElement | null>; // Layout Shift Ref (适用于由于动态高度 如 grid 布局 而引起表格高度计算偏差的情况)
  tableDataFiled?: string; // 表格 data 数据集字段
  pageCountFiled?: string; // 表格pageCount页码数字段
  itemCountFiled?: string; // 表格itemCount总条数字段
  extraField?: string[]; // 表格额外返回字段，可通过返回的getExtraFieldValue字段获取
  pageField?: string; // 表格 page字段
  pageSizeField?: string; // 表格pageSize字段
  rowKey?: (rowData: Record<string, any>) => number | string; // 行唯一标识
  checkedRowKeys?: Array<string | number>; // 被选中的行的 key
  tbPadding?: number; // 单元格内边距
  // 工具栏
  toolbarConfig?: {
    refresh?: boolean; // 刷新列表
    reset?: boolean; // 重置并刷新
    custom?: boolean; // 自定义列功能
    iconMap?: {
      reset?: HTMLImageElement;
      refresh?: HTMLImageElement;
      iconColor?: string;
      bgIcon?: Component;
    };
  };
} & Omit<TableProps, 'columns' | 'data' | 'rowKey' | 'checkedRowKeys'>;

export type SDataTableProps = Partial<DynamicProps<STableProps>>;

export type ReturnType = {
  tableRef: Ref<HTMLElement | null>;
  dynamicColumns: Ref<any[]>;
  assignColumn: Ref<any[]>;
  tempQueryData: object;
  getBindValue: object;
  loadData: () => void;
  getExtraFieldValue: Ref<object>;
};

/**
 * @description 表格对外暴露的方法
 */
export interface TableActionType {
  setProps: (tableProps: Partial<TableProps>) => Promise<void>;
  /** Fetch data. Pass `reset` to clear column filters and sorts first. */
  loadData: (params?: any, reset?: boolean) => Promise<void>;
  /** Current query payload: pagination + filters + sorts. */
  getTbFilterData: () => Record<string, any> | undefined;
  /** Current query payload without the `form` and `filters` keys. */
  getTbFilterDataWithoutFormAndFilters: () => Record<string, any> | undefined;
  refreshCurrentPage: () => Promise<void> | undefined;
  /**
   * Total row count.
   *
   * Returns `undefined` when reached through the `useSTable` wrapper before the
   * component has registered itself. On the component instance itself it is
   * always a number.
   */
  getTableTotal: () => number | undefined;
}

export type TableRegisterFn = (tableInstance: TableActionType) => void;

export type UseTableReturnType = [TableRegisterFn, TableActionType];
