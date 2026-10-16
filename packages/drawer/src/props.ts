import { drawerProps } from 'naive-ui';

export const drawerSProps = {
  ...drawerProps,
  closable: {
    type: Boolean,
    default: true,
  },
  resizable: {
    type: Boolean,
    default: true,
  },
  defaultWidth: {
    type: Number,
    default: 500,
  },
  // 是否显示确定按钮
  showSubmitBtn: {
    type: Boolean,
    default: true,
  },
  // 确定按钮文字
  subBtnText: {
    type: String,
    default: '确定',
  },
  // 取消按钮文字
  cancelBtnText: {
    type: String,
    default: '取消',
  },
  // 标题
  title: {
    type: String,
    default: '标题',
  },
  // 底部动作 默认绑定
  showAction: {
    type: Boolean,
    default: true,
  },
};
