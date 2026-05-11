export type Comparator<T> = (a: T, b: T) => number

export type ForEachCallback<T> = (value: T, index: number) => void

export interface LeftistHeapOptions<T> {
  comparator?: Comparator<T>
  elements?: T[]
}

export interface LeftistHeapHandle<T> {
  value: T
}

interface LeftistHeapNode<T> {
  value: T
  left: LeftistHeapNode<T> | null
  right: LeftistHeapNode<T> | null
  rank: number
  handle: LeftistHeapHandle<T>
}

export type { LeftistHeapNode }
