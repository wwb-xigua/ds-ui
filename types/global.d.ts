import type {
  ComponentPublicInstance,
  FunctionalComponent,
  PropType as VuePropType,
  VNode,
  VNodeChild,
} from 'vue';

declare global {
  /* ---------- 基础类型别名 ---------- */

  declare type Recordable<T = any> = Record<string, T>;
  declare type ReadonlyRecordable<T = any> = { readonly [key: string]: T };
  declare type Nullable<T> = T | null;
  declare type NonNullable<T> = T extends null | undefined ? never : T;
  declare type Writable<T> = { -readonly [P in keyof T]: T[P] };
  declare type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

  /* ---------- Vue 辅助类型 ---------- */

  declare type VueNode = VNodeChild | JSX.Element;
  declare type PropType<T> = VuePropType<T>;

  declare type EmitType = (event: string, ...args: any[]) => void;
  declare interface Fn<T = any, R = T> {
    (...arg: T[]): R;
  }

  declare type LabelValueOption = {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
  };
  declare type LabelValueOptions = LabelValueOption[];

  declare interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
    $el: T;
  }
  declare type ComponentRef<T extends HTMLElement = HTMLDivElement> = ComponentElRef<T> | null;
  declare type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

  /* ---------- 组件类型增强 ---------- */

  declare module 'vue' {
    export type JSXComponent<Props = any> =
      | { new (): ComponentPublicInstance<Props> }
      | FunctionalComponent<Props>;
  }

  namespace JSX {
    type Element = VNode;
    type ElementClass = ComponentPublicInstance;

    interface ElementAttributesProperty {
      $props: any;
    }

    interface IntrinsicElements {
      [elem: string]: any;
    }

    interface IntrinsicAttributes {
      [elem: string]: any;
    }
  }
}

export {};
