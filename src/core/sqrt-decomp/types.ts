export type { SqrtDecomposition } from './index.js'

export type SqrtDecompositionOptions<T> = {
  operation: (a: T, b: T) => T
  identity: T
}

export type ForEachCallback<T> = (item: T, index: number) => void
