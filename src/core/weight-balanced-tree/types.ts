export type CompareFunction<K> = (a: K, b: K) => number

export interface WeightBalancedTreeOptions<K> {
  compare: CompareFunction<K>
  delta: number
  gamma: number
}

export interface WeightBalancedTreeStats {
  size: number
  height: number
  minHeight: number
  isBalanced: boolean
  idealHeight: number
}

export interface WBNode<K> {
  key: K
  left: WBNode<K> | null
  right: WBNode<K> | null
  size: number
}

function defaultCompare<K>(a: K, b: K): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export const DEFAULT_WBT_OPTIONS: WeightBalancedTreeOptions<never> = {
  compare: defaultCompare,
  delta: 3,
  gamma: 2,
}
