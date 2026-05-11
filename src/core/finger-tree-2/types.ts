export interface FingerTreeMeasurer<T, V> {
  measure(value: T): V
  combine(a: V, b: V): V
  identity(): V
}

export type Affix<T> = readonly T[]

export interface FingerTree<_T, V> {
  readonly size: V
}

export type FingerTreeEmpty<T, V> = { readonly tag: 'empty'; readonly measurer: FingerTreeMeasurer<T, V> }

export type FingerTreeSingle<T, V> = { readonly tag: 'single'; readonly value: T; readonly measurer: FingerTreeMeasurer<T, V> }

export type FingerTreeDeep<T, V> = {
  readonly tag: 'deep'
  readonly left: Affix<T>
  readonly spine: FingerTreeNode<T, V>
  readonly right: Affix<T>
  readonly measurer: FingerTreeMeasurer<T, V>
  readonly size: V
}

export type FingerTreeNode<T, V> = FingerTreeEmpty<T, V> | FingerTreeSingle<T, V> | FingerTreeDeep<T, V>

export interface FingerTreeOptions<T, V> {
  measurer: FingerTreeMeasurer<T, V>
}
