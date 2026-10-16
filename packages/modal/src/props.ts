import { modalProps } from 'naive-ui';

export const basicProps = {
  ...modalProps,
  subBtnText: {
    type: String,
    default: '确定',
  },
  cancelBtnText: {
    type: String,
    default: '取消',
  },
  width: {
    type: Number,
    default: 450,
  },
  title: {
    type: String,
    default: '',
  },
  titleSuffix: {
    type: String,
    default: '',
  },
  maskClosable: {
    type: Boolean,
    default: false,
  },
  iconType: {
    type: String,
    default: 'primary',
  },
  isDraggable: {
    type: Boolean,
    default: true,
  },
  // 只支持直接绑定在 SModal 组件上
  showAction: {
    type: Boolean,
    default: true,
  },
};
