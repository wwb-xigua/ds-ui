import { NText, tableProps } from 'naive-ui';
import { h } from 'vue';

export const basicProps = {
  ...tableProps,
  // 是否使用斑马线条纹
  striped: {
    type: Boolean,
    default: true,
  },
  // 是否显示 border
  bordered: {
    type: Boolean,
    default: false,
  },
  // 是否显示 bottom border
  bottomBordered: {
    type: Boolean,
    default: false,
  },
  // 是否不设定行的分割线，当参数为true时，则单元格没有下边线
  singleColumn: {
    type: Boolean,
    default: false,
  },
  // 表格是否自动分页数据，在异步的状况下你可能需要把它设为 true
  remote: {
    type: Boolean,
    default: true,
  },
  // 自定义单元格渲染，优先级低于列的 render
  renderCell: {
    type: Function,
    default: (value: any) => {
      return value ?? h(NText, { depth: 3 }, { default: () => '-' });
    },
  },
  // 表格自定义动态高度差
  dynamicCustomHeightDifference: {
    type: Number,
    default: 0,
  },
  // 是否自动加载 (可手动调用loadData方法)
  autoLoad: {
    type: Boolean,
    default: true,
  },
  // 是否自动计算 scroll-x
  autoScrollX: {
    type: Boolean,
    default: false,
  },
  // 表格动态高度下最小展示内容行数
  dynamicMinLines: {
    type: Number,
    default: 3,
  },
  // 是否展示分页
  showPagination: {
    type: Boolean,
    default: true,
  },
  // 表格数据数据字段
  tableDataFiled: {
    type: String,
    default: 'records',
  },
  // 分页字段
  pageField: {
    type: String,
    default: 'current',
  },
  // 分页大小字段
  pageSizeField: {
    type: String,
    default: 'size',
  },
  // 分页数字段
  pageCountFiled: {
    type: String,
    default: 'pages',
  },
  // 分页数字段
  itemCountFiled: {
    type: String,
    default: 'total',
  },
  // 被选中的行的 key
  checkedRowKeys: {
    type: Array,
    default: [],
  },
  // 单元格内边距
  tbPadding: {
    type: Number,
    default: undefined,
  },
};
