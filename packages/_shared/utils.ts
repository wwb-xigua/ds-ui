/**
 * Small internal utilities shared across components.
 *
 * These deliberately replace the handful of `lodash-es` helpers the library
 * used previously. `lodash-es` is a pure-ESM package (`"type": "module"` with no
 * CommonJS build), so `require('lodash-es')` throws `ERR_REQUIRE_ESM`. Because
 * the library ships a CommonJS build, that made the *entire* CJS bundle
 * unloadable — `require('@coldboy/ds-ui')` failed in Jest, Node SSR, and anywhere else
 * using CommonJS. Dropping the dependency fixes that and removes ~70 KB.
 *
 * Behaviour is kept faithful to lodash where it mattered:
 * `isEmpty(0)` and `isEmpty(false)` are `true`, and `isEmpty('a')` is `false`.
 */

/* ---------- predicates ---------- */

/** Matches `lodash.isNumber` for the primitive types used in practice. */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' || value instanceof Number;
}

/**
 * Matches `lodash.isEmpty`: nullish values, empty strings/arrays/objects, and
 * non-collection primitives (booleans, numbers) are all considered empty.
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'boolean' || typeof value === 'number') return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return true;
}

/* ---------- object helpers ---------- */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== '[object Object]') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Deep-merges every argument into a **new** object and returns it.
 *
 * Unlike lodash's `merge`, this does not mutate the first argument, and arrays
 * are replaced wholesale rather than merged index-by-index — which matters for
 * query payloads where `sorts` / `filters` arrive from different sources.
 *
 * The result type is intentionally loose: callers merge heterogeneous payloads
 * (pagination + form + sorts + filters), so no single shape describes the result.
 */
export function merge(
  ...sources: Array<Record<string, any> | undefined | null>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const source of sources) {
    if (source == null) continue;

    for (const key of Object.keys(source)) {
      const value = (source as Record<string, any>)[key];

      if (isPlainObject(value)) {
        const existing = result[key];
        result[key] = isPlainObject(existing) ? merge(existing, value) : merge({}, value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Reads a nested value using a dotted path, e.g. `getByPath(obj, 'a.b.c')`.
 *
 * Only own properties are traversed, so `__proto__` or `constructor` segments
 * cannot be used to reach up the prototype chain.
 */
export function getByPath(source: unknown, path: string): any {
  if (source == null || !path) return undefined;

  return String(path)
    .split('.')
    .reduce<any>(
      (acc, segment) =>
        acc != null && Object.prototype.hasOwnProperty.call(acc, segment)
          ? acc[segment]
          : undefined,
      source,
    );
}

/**
 * Writes a nested value using a dotted path, creating intermediate objects as
 * needed. Mutates and returns `target`, like `lodash.set`.
 */
export function setByPath<T extends Record<string, any>>(
  target: T,
  path: string,
  value: unknown,
): T {
  const segments = String(path).split('.');
  let cursor: Record<string, any> = target as Record<string, any>;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    if (cursor[key] === null || typeof cursor[key] !== 'object') {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  cursor[segments[segments.length - 1]] = value;
  return target;
}

/* ---------- misc ---------- */

let idCounter = 0;

/** Monotonic id generator, replacing `lodash.uniqueId`. */
export function uniqueId(prefix = ''): string {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}
