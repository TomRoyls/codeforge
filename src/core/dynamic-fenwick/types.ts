export interface DynamicFenwickOptions<T> {
  combiner: (a: T, b: T) => T
  identity: T
  subtractor: (a: T, b: T) => T
}

export const DEFAULT_DYNAMIC_FENWICK_OPTIONS: DynamicFenwickOptions<number> = {
  combiner: (a, b) => a + b,
  identity: 0,
  subtractor: (a, b) => a - b,
}
