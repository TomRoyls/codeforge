export type CombineFn<T> = (a: T, b: T) => T

export type LazyApplyFn<T, U> = (value: T, lazy: U, rangeLen: number) => T

export type LazyCombineFn<U> = (existing: U, incoming: U) => U

export interface SegmentTreeOptions<T, U = T> {
  combine?: CombineFn<T>
  identity: T
  lazyIdentity: U
  lazyApply?: LazyApplyFn<T, U>
  lazyCombine?: LazyCombineFn<U>
}

export interface Operation<T, U = T> {
  combine: CombineFn<T>
  identity: T
  lazyIdentity: U
  lazyApply: LazyApplyFn<T, U>
  lazyCombine: LazyCombineFn<U>
}
