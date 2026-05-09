export interface SegmentTree2DOptions {
  identity: number
  combine: (a: number, b: number) => number
}

export const SUM_2D: SegmentTree2DOptions = {
  identity: 0,
  combine: (a, b) => a + b,
}

export const MIN_2D: SegmentTree2DOptions = {
  identity: Infinity,
  combine: (a, b) => Math.min(a, b),
}

export const MAX_2D: SegmentTree2DOptions = {
  identity: -Infinity,
  combine: (a, b) => Math.max(a, b),
}

export const DEFAULT_SEGMENT_TREE_2D_OPTIONS: SegmentTree2DOptions = {
  ...SUM_2D,
}
