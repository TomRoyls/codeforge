export type { SegmentTree2 } from './index.js'

export type SegmentTree2Options<T> = {
  merge?: (a: T, b: T) => T
  identity?: T
}

export type ForEachCallback<T> = (item: T, index: number) => void
