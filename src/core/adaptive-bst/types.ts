export type Comparator<T> = (a: T, b: T) => number

export type ForEachCallback<T> = (value: T, index: number) => void

export interface AdaptiveBSTOptions<T> {
  comparator?: Comparator<T>
}

export interface AdaptiveBSTNode<T> {
  value: T
  left: AdaptiveBSTNode<T> | null
  right: AdaptiveBSTNode<T> | null
  parent: AdaptiveBSTNode<T> | null
  priority: number
  insertId: number
}
