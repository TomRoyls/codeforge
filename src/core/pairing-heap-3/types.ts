export type Comparator<T> = (a: T, b: T) => number

export interface PairingHeap3Options<T> {
  comparator?: Comparator<T>
}

export interface PairingHeap3Node<T> {
  value: T
  child: PairingHeap3Node<T> | null
  sibling: PairingHeap3Node<T> | null
}
