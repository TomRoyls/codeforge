export type { FenwickTree2 } from './index.js'

export type BinaryOperation<T> = {
  add: (a: T, b: T) => T
  subtract: (a: T, b: T) => T
  identity: T
}

export type ForEachCallback<T> = (item: T, index: number) => void
