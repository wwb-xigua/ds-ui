import type { DialogOptions } from 'naive-ui';

/**
 * @description 弹窗对外暴露的方法
 */
export interface ModalMethods {
  setProps: (modalProps: Partial<ModalProps>) => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  setSubLoading: (status: boolean) => void;
}

/**
 * @description 支持修改 DialogOptions 参数
 */
export type ModalProps = DialogOptions;

export type RegisterFn = (ModalInstance: ModalMethods) => void;

export type UseModalReturnType = [RegisterFn, ModalMethods];
