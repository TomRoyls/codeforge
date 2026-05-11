export type { SqrtDecomp2 } from './index.js'

export type SqrtDecomp2Options<T> = {
  blockSize?: number
  merge?: (a: T, b: T) => T
  identity?: T
}

export type ForEachCallback<T> = (item: T, index: number) => void
