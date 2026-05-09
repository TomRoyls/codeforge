export interface PairingHeapNode<T> {
  value: T
  children: PairingHeapNode<T>[]
  parent: PairingHeapNode<T> | null
}

export interface PairingHeapOptions<T> {
  comparator?: (a: T, b: T) => number
}

export const DEFAULT_COMPARATOR = <T>(a: T, b: T): number => {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
