import { ComponentType } from './index';
import type { CSSProperties } from 'vue';
import type { GridProps, GridItemProps } from 'naive-ui';
import type { ButtonProps } from 'naive-ui';

export interface RenderReturnParams {
  schema: FormSchema;
  values: Recordable;
  model: Recordable;
  field: string;
}

export interface componentProps {
  options?: any[];
  placeholder?: string;
  showButton?: boolean;
  onInput?: () => Recordable;
  onChange?: () => Recordable;
}

export interface FormSchema {
  field: string;
  label?: string;
  labelWidth?: number | string | undefined;
  labelMessage?: string;
  labelMessageStyle?: object | string;
  defaultValue?: any;
  component?: ComponentType;
  componentProps?: any;
  slot?: string;
  rules?: object | object[];
  giProps?: GridItemProps;
  isFull?: boolean;
  suffix?: string;
  showFeedback?: boolean;
  showLabel?: boolean;
  requireMarkPlacement?: string;
  hidden?: boolean | ((renderCallbackParams: RenderReturnParams) => boolean);
}

export interface FormProps {
  model?: Recordable;
  labelWidth?: number | string | undefined;
  schemas?: FormSchema[];
  inline?: boolean;
  layout?: string;
  size?: string;
  labelPlacement?: string;
  isFull?: boolean;
  showActionButtonGroup?: boolean;
  showResetButton?: boolean;
  advancedButtonColor?: string;
  resetButtonOptions?: Partial<ButtonProps>;
  showSubmitButton?: boolean;
  showAdvancedButton?: boolean;
  submitButtonOptions?: Partial<ButtonProps>;
  submitButtonText?: string;
  resetButtonText?: string;
  gridProps?: GridProps;
  giProps?: GridItemProps;
  resetFunc?: () => Promise<void>;
  submitFunc?: () => Promise<void>;
  submitOnReset?: boolean;
  baseGridStyle?: CSSProperties;
  draggable?: boolean;
  collapsed?: boolean;
  collapsedRows?: number;
  requireMarkPlacement?: string;
  showColon?: boolean;
  suffix?: boolean;
  justify?: 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}

export interface FormActionType {
  submitForm: () => Promise<any>;
  setProps: (formProps: Partial<FormProps>) => Promise<void>;
  setSchema: (schemaProps: Partial<FormSchema[]>) => Promise<void>;
  setFieldsValue: (values: Recordable) => void;
  clearValidate: (name?: string | string[]) => Promise<void>;
  getFieldsValue: () => Recordable;
  resetFields: () => Promise<void>;
  validate: (keyList?: any[]) => Promise<any>;
  setLoadingSub: (status: boolean) => void;
}

export type RegisterFn = (formInstance: FormActionType) => void;

export type UseFormReturnType = [RegisterFn, FormActionType];
