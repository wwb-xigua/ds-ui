import type { DialogOptions } from 'naive-ui';

/**
 * @description 抽屉对外暴露的方法
 */
export interface DrawerMethods {
  setProps: (props) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setSubLoading: (status: boolean) => void;
}

/**
 * @description 支持修改 DialogOptions 参数
 */
export type DrawerProps = DialogOptions;

// 实例注测
export type RegisterFn = (DrawerInstance: DrawerMethods) => void;

// use 返回类
export type UseDrawerReturnType = [RegisterFn, DrawerMethods];
