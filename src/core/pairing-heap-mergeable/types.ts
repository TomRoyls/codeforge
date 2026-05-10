export interface MergeablePairingHeapNode<T> {
  value: T
  child: MergeablePairingHeapNode<T> | null
  sibling: MergeablePairingHeapNode<T> | null
  parent: MergeablePairingHeapNode<T> | null
  id: number
}

export interface MergeablePairingHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
