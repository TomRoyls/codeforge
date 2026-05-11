export type Comparator<T> = (a: T, b: T) => number

export type ForEachCallback<T> = (value: T, index: number) => void

export interface PairingHeap2Options<T> {
  comparator?: Comparator<T>
}

export interface PairingHeap2Node<T> {
  value: T
  child: PairingHeap2Node<T> | null
  sibling: PairingHeap2Node<T> | null
  prev: PairingHeap2Node<T> | null
}
