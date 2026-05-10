export interface Rect {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface IntervalMap2DOptions {
  normalizeBounds?: boolean
}

export type Entry<V> = [Rect, V]
