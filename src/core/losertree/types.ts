export type Comparator<T> = (a: T, b: T) => number

export type ForEachCallback<T> = (value: T, index: number) => void

export interface LoserTreeOptions<T> {
  comparator?: Comparator<T>
}
