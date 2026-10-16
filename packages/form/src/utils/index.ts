import { unref } from 'vue';
/**
 * @description: 判断值是否未某个类型
 * @param {unknown} val
 * @param {string} type
 * @return {*}
 */
export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`;
}

/**
 * @description: 判断是否为对象
 * @param {any} val
 * @param {*} any
 * @return {*}
 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, 'Object');
};

/**
 * @description: 深度合并
 * @param {any} src
 * @param {any} target
 * @return {*}
 */
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string;
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key]);
  }
  return src;
}

/**
 * @description: 是否为数组
 * @param {any} val
 * @return {*}
 */
export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val);
}

/**
 * @description: 是否为boolean类型
 * @param {unknown} val
 * @return {*}
 */
export function isBoolean(val: unknown): val is boolean {
  return is(val, 'Boolean');
}

/**
 * @description: 是否为函数
 * @param {unknown} val
 * @return {*}
 */
export function isFunction<T = Function>(val: unknown): val is T {
  return is(val, 'Function');
}

/**
 * @description: 是否生产环境
 * @return {*}
 */
export function isProdMode(): boolean {
  return import.meta.env?.['PROD'];
}

export function getDynamicProps<T, U>(props: T): Partial<U> {
  const ret: Recordable = {};

  Object.keys(props as any).map((key) => {
    ret[key] = unref((props as Recordable)[key]);
  });
  return ret as Partial<U>;
}

/**
 * @description: 按点分路径读取嵌套值，如 getByPath(obj, 'a.b.c')
 *
 * Replaces dynamic `eval` / `new Function` based path resolution. Traverses
 * own properties only, so `__proto__` / `constructor` style segments cannot be
 * used to reach up the prototype chain.
 */
export function getByPath(source: any, path: string): any {
  if (source == null || !path) return undefined;
  return path.split('.').reduce((acc, segment) => {
    if (acc == null) return undefined;
    return Object.prototype.hasOwnProperty.call(acc, segment) ? acc[segment] : undefined;
  }, source);
}

/**
 * @description: 是否已定义
 * @param {*} T
 * @return {*}
 */
export const isDef = <T = unknown>(val?: T): val is T => {
  return typeof val !== 'undefined';
};

/**
 * @description: 是否为字符串
 * @param {unknown} val
 * @return {*}
 */
export function isString(val: unknown): val is string {
  return is(val, 'String');
}

export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val);
};

export function isNull(val: unknown): val is null {
  return val === null;
}

/**
 * @description: isNullOrUnDef
 * @param {unknown} val
 * @return {*}
 */
export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}
