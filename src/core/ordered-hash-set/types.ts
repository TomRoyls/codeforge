export type { OrderedHashSet } from './index.js'

export type OrderedHashSetOptions<T> = {
  hash?: (value: T) => number
}

export type ForEachCallback<T> = (value: T, index: number) => void
