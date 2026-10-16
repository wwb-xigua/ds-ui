import type { CSSProperties, PropType } from 'vue';
import { FormSchema } from './types/form';
import type { GridProps, GridItemProps } from 'naive-ui';
import type { ButtonProps } from 'naive-ui';
import { propTypes } from './utils/propTypes';
import { formProps } from 'naive-ui';
export const basicProps = {
  ...formProps,
  // 标签宽度  固定宽度
  labelWidth: {
    type: [Number, String] as PropType<number | string>,
    default: 'auto',
  },
  // 表单配置规则
  schemas: {
    type: [Array] as PropType<FormSchema[]>,
    default: () => [],
  },
  // 布局方式
  layout: {
    type: String,
    default: 'inline',
  },
  // 是否展示为行内表单
  inline: {
    type: Boolean,
    default: false,
  },
  // 标签位置
  labelPlacement: {
    type: String,
    default: 'left',
  },
  // 必填星号的位置
  requireMarkPlacement: {
    type: String,
    default: 'left',
  },
  // 组件是否width 100%
  isFull: {
    type: Boolean,
    default: true,
  },
  // 是否显示操作按钮（查询/重置）
  showActionButtonGroup: propTypes.bool.def(true),
  // 显示重置按钮
  showResetButton: propTypes.bool.def(true),
  // 重置按钮配置
  resetButtonOptions: Object as PropType<Partial<ButtonProps>>,
  // 显示确认按钮
  showSubmitButton: propTypes.bool.def(true),
  // 确认按钮配置
  submitButtonOptions: Object as PropType<Partial<ButtonProps>>,
  // 展开收起按钮
  showAdvancedButton: propTypes.bool.def(true),
  // 展开按钮颜色
  advancedButtonColor: {
    type: String,
    default: '#109594',
  },
  // 确认按钮文字
  submitButtonText: {
    type: String,
    default: '查询',
  },
  // 重置按钮文字
  resetButtonText: {
    type: String,
    default: '重置',
  },
  // grid 配置
  gridProps: Object as PropType<GridProps>,
  // gi配置
  giProps: Object as PropType<GridItemProps>,
  // grid 样式
  baseGridStyle: {
    type: Object as PropType<CSSProperties>,
  },
  // 是否折叠
  collapsed: {
    type: Boolean,
    default: false,
  },
  // 重置时是否提交表单
  submitOnReset: {
    type: Boolean,
    default: false,
  },
  // 默认展示的行数
  collapsedRows: {
    type: Number,
    default: 1,
  },
  // 开启回车事件监听 触发 Submit
  isEnterSubmit: {
    type: Boolean,
    default: false,
  },
  // 标签label后面是否显示冒号 ":"
  showColon: {
    type: Boolean,
    default: true,
  },
  // 栅格后缀
  suffix: {
    type: Boolean,
    default: true,
  },
  // 按钮组区布局 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
  justify: {
    type: String,
    default: 'end',
  },
};
