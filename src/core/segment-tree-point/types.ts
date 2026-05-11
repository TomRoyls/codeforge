export type { SegmentTreePoint } from './index.js'

export type SegmentTreePointOptions<T> = {
  operation?: (a: T, b: T) => T
  identity?: T
}

export type ForEachCallback<T> = (item: T, index: number) => void
