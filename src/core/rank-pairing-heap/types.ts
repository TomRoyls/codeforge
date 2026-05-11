export type Comparator<T> = (a: T, b: T) => number

export type ForEachCallback<T> = (value: T, index: number) => void

export interface RankPairingHeapOptions<T> {
  comparator?: Comparator<T>
}

export interface RankPairingHeapNode<T> {
  value: T
  rank: number
  child: RankPairingHeapNode<T> | null
  sibling: RankPairingHeapNode<T> | null
  prev: RankPairingHeapNode<T> | null
}
